"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlayHintProcessor = void 0;
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const reflection_1 = require("../../astUtils/reflection");
const visitors_1 = require("../../astUtils/visitors");
const Parser_1 = require("../../parser/Parser");
const util_1 = require("../../util");
class InlayHintProcessor {
    constructor(event) {
        this.event = event;
    }
    process() {
        if (!(0, reflection_1.isBrsFile)(this.event.file)) {
            return;
        }
        this.collectParameterNameHints(this.event.file);
    }
    collectParameterNameHints(file) {
        const range = this.event.range;
        file.ast.walk((0, visitors_1.createVisitor)({
            CallExpression: (call) => {
                if (!call.range || !util_1.util.rangesIntersectOrTouch(call.range, range)) {
                    return;
                }
                this.emitParameterNameHints(file, call);
            },
            CallfuncExpression: (call) => {
                if (!call.range || !util_1.util.rangesIntersectOrTouch(call.range, range)) {
                    return;
                }
                this.emitParameterNameHintsForCallfunc(file, call);
            }
        }), {
            walkMode: visitors_1.WalkMode.visitAllRecursive
        });
    }
    emitParameterNameHints(file, call) {
        if (!call.args || call.args.length === 0) {
            return;
        }
        const params = this.resolveCallParameters(file, call);
        if (!params) {
            return;
        }
        this.pushHintsForArgs(call.args, params);
    }
    emitParameterNameHintsForCallfunc(file, call) {
        var _a;
        if (!call.args || call.args.length === 0) {
            return;
        }
        const name = (_a = call.methodName) === null || _a === void 0 ? void 0 : _a.text;
        if (!name) {
            return;
        }
        const params = this.resolveCallfuncParameters(file, name);
        if (!params) {
            return;
        }
        this.pushHintsForArgs(call.args, params);
    }
    /**
     * For a CallExpression, find the function/method being called and return its parameter list,
     * or undefined if the target cannot be uniquely resolved.
     */
    resolveCallParameters(file, call) {
        var _a, _b, _c;
        //constructor: `new Foo(...)`
        if ((0, reflection_1.isNewExpression)(call.parent)) {
            const className = call.parent.className.getName(Parser_1.ParseMode.BrighterScript);
            const classLink = file.getClassFileLink(className);
            if (!classLink) {
                return undefined;
            }
            const ctor = file.getClassMethod(classLink.item, 'new');
            return (_a = ctor === null || ctor === void 0 ? void 0 : ctor.func) === null || _a === void 0 ? void 0 : _a.parameters;
        }
        const callee = call.callee;
        //plain function call: `foo(...)`
        if ((0, reflection_1.isVariableExpression)(callee)) {
            const name = callee.name.text;
            const containingNamespace = (_b = callee.findAncestor(reflection_1.isNamespaceStatement)) === null || _b === void 0 ? void 0 : _b.getName(Parser_1.ParseMode.BrighterScript);
            return this.lookupFunctionParameters(file, name, containingNamespace);
        }
        //namespace call or method call: `ns.foo(...)` / `m.foo(...)` / `instance.foo(...)`
        if ((0, reflection_1.isDottedGetExpression)(callee)) {
            const name = callee.name.text;
            const parts = util_1.util.getAllDottedGetParts(callee);
            if (!parts || parts.length < 2) {
                return undefined;
            }
            //drop the last part (the function name) to get the namespace/receiver path
            const dotPart = parts.slice(0, parts.length - 1).map(x => x.text).join('.');
            //prefer namespace lookup when the dotPart is a known namespace
            const scope = file.program.getFirstScopeForFile(file);
            const namespace = (_c = scope === null || scope === void 0 ? void 0 : scope.namespaceLookup) === null || _c === void 0 ? void 0 : _c.get(dotPart.toLowerCase());
            if (namespace) {
                return this.lookupFunctionParameters(file, name, dotPart);
            }
            //otherwise, treat as method call on m or another receiver - look across class methods
            return this.lookupClassMethodParameters(file, callee, name);
        }
        return undefined;
    }
    lookupFunctionParameters(file, name, namespaceName) {
        var _a;
        const matches = file.program.getStatementsByName(name, file, namespaceName);
        if (matches.length !== 1) {
            return undefined;
        }
        const statement = matches[0].item;
        if ((0, reflection_1.isFunctionStatement)(statement) || (0, reflection_1.isMethodStatement)(statement)) {
            return (_a = statement.func) === null || _a === void 0 ? void 0 : _a.parameters;
        }
        return undefined;
    }
    /**
     * For a method call like `m.foo(...)`, find a uniquely-resolvable method statement.
     * If the receiver is `m`, prefer the enclosing class. Otherwise fall back to a name search
     * across all classes (only used when there's exactly one match).
     */
    lookupClassMethodParameters(file, callee, name) {
        var _a, _b;
        if ((0, reflection_1.isVariableExpression)(callee.obj) && callee.obj.name.text === 'm') {
            const enclosingClass = callee.obj.findAncestor(reflection_1.isClassStatement);
            if (enclosingClass) {
                const method = file.getClassMethod(enclosingClass, name, true);
                if (method) {
                    return (_a = method.func) === null || _a === void 0 ? void 0 : _a.parameters;
                }
            }
        }
        //fallback: search all classes for a single matching method name
        const matches = file.program.getStatementsByName(name, file).filter(link => (0, reflection_1.isClassStatement)(link.item.parent));
        if (matches.length !== 1) {
            return undefined;
        }
        const statement = matches[0].item;
        if ((0, reflection_1.isMethodStatement)(statement) || (0, reflection_1.isFunctionStatement)(statement)) {
            return (_b = statement.func) === null || _b === void 0 ? void 0 : _b.parameters;
        }
        return undefined;
    }
    resolveCallfuncParameters(file, name) {
        var _a;
        //callfunc invocations are dispatched through XML components - look across xml scopes for a function with this name
        const matches = file.program.getScopes()
            .filter(scope => (0, reflection_1.isXmlScope)(scope))
            .flatMap(scope => file.program.getStatementsForXmlFile(scope, name));
        if (matches.length !== 1) {
            return undefined;
        }
        const statement = matches[0].item;
        if ((0, reflection_1.isFunctionStatement)(statement) || (0, reflection_1.isMethodStatement)(statement)) {
            return (_a = statement.func) === null || _a === void 0 ? void 0 : _a.parameters;
        }
        return undefined;
    }
    pushHintsForArgs(args, params) {
        var _a, _b, _c;
        for (let i = 0; i < args.length && i < params.length; i++) {
            const arg = args[i];
            const param = params[i];
            const paramName = (_a = param === null || param === void 0 ? void 0 : param.name) === null || _a === void 0 ? void 0 : _a.text;
            if (!paramName || !(arg === null || arg === void 0 ? void 0 : arg.range)) {
                continue;
            }
            //skip when the argument is just an identifier that already matches the parameter name
            if ((0, reflection_1.isVariableExpression)(arg) && ((_c = (_b = arg.name) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === paramName.toLowerCase()) {
                continue;
            }
            this.event.inlayHints.push({
                position: arg.range.start,
                label: `${paramName}:`,
                kind: vscode_languageserver_protocol_1.InlayHintKind.Parameter,
                paddingRight: true
            });
        }
    }
}
exports.InlayHintProcessor = InlayHintProcessor;
//# sourceMappingURL=InlayHintProcessor.js.map