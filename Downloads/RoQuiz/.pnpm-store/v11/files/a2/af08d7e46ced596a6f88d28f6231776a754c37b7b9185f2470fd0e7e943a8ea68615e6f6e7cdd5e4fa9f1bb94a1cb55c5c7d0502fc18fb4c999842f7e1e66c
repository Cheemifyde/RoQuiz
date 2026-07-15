"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeActionsProcessor = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const CodeActionUtil_1 = require("../../CodeActionUtil");
const DiagnosticMessages_1 = require("../../DiagnosticMessages");
const Parser_1 = require("../../parser/Parser");
const util_1 = require("../../util");
const reflection_1 = require("../../astUtils/reflection");
const visitors_1 = require("../../astUtils/visitors");
const TokenKind_1 = require("../../lexer/TokenKind");
const codeActionHelpers_1 = require("./codeActionHelpers");
const SGParser_1 = require("../../parser/SGParser");
class CodeActionsProcessor {
    constructor(event) {
        this.event = event;
        this.suggestedImports = new Set();
    }
    /**
     * Processes all diagnostics in the event and emits code actions for each recognized diagnostic code.
     */
    process() {
        // First pass: individual fixes for each diagnostic at the cursor position
        for (const diagnostic of this.event.diagnostics) {
            if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.cannotFindName || diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.cannotFindFunction) {
                this.suggestCannotFindNameQuickFix(diagnostic);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.classCouldNotBeFound) {
                this.suggestClassImportQuickFix(diagnostic);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.xmlComponentMissingExtendsAttribute) {
                this.suggestMissingExtendsQuickFix(diagnostic);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.voidFunctionMayNotReturnValue) {
                this.suggestVoidFunctionReturnQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.nonVoidFunctionMustReturnValue) {
                this.suggestNonVoidFunctionReturnQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.referencedFileDoesNotExist) {
                this.suggestRemoveScriptImportQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryScriptImportInChildFromParent) {
                this.suggestRemoveScriptImportQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryCodebehindScriptImport) {
                this.suggestRemoveScriptImportQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.scriptImportCaseMismatch) {
                this.suggestScriptImportCasingQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.missingOverrideKeyword) {
                this.suggestMissingOverrideQuickFixes([diagnostic]);
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.cannotUseOverrideKeywordOnConstructorFunction) {
                this.suggestRemoveOverrideFromConstructorQuickFixes([diagnostic]);
            }
            else if ((0, DiagnosticMessages_1.isDiagnosticOfType)(diagnostic, 'mismatchedEndingToken')) {
                this.suggestMismatchedEndingTokenQuickFixes([diagnostic]);
            }
        }
        // Second pass: fix-all actions for any code that appeared in the event.
        // Also makes sure that fix-all actions appear after individual fixes
        const eventCodes = new Set(this.event.diagnostics.map(d => d.code));
        const fixAllDiagsByCode = this.collectFixAllDiagnostics(eventCodes);
        // only offer fix-all when there are multiple instances of the same issue in the file
        for (const [code, allInFile] of fixAllDiagsByCode) {
            if (allInFile.length > 1) {
                if (code === DiagnosticMessages_1.DiagnosticCodeMap.voidFunctionMayNotReturnValue) {
                    this.suggestVoidFunctionReturnQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.nonVoidFunctionMustReturnValue) {
                    this.suggestNonVoidFunctionReturnQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryCodebehindScriptImport) {
                    this.suggestRemoveScriptImportQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.cannotUseOverrideKeywordOnConstructorFunction) {
                    this.suggestRemoveOverrideFromConstructorQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.referencedFileDoesNotExist) {
                    this.suggestRemoveScriptImportQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryScriptImportInChildFromParent) {
                    this.suggestRemoveScriptImportQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.scriptImportCaseMismatch) {
                    this.suggestScriptImportCasingQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.missingOverrideKeyword) {
                    this.suggestMissingOverrideQuickFixes(allInFile);
                }
                else if (code === DiagnosticMessages_1.DiagnosticCodeMap.mismatchedEndingToken) {
                    this.suggestMismatchedEndingTokenQuickFixes(allInFile);
                }
            }
        }
        // Import fix-all aggregates across multiple codes so it runs as its own step
        if (eventCodes.has(DiagnosticMessages_1.DiagnosticCodeMap.cannotFindName) ||
            eventCodes.has(DiagnosticMessages_1.DiagnosticCodeMap.cannotFindFunction) ||
            eventCodes.has(DiagnosticMessages_1.DiagnosticCodeMap.classCouldNotBeFound)) {
            this.suggestMissingImportsFixAllQuickFix();
        }
        // Suppression actions appear last so real fixes are surfaced first
        for (const diagnostic of this.event.diagnostics) {
            this.suggestDisableDiagnosticQuickFixes(diagnostic);
        }
        this.suggestedImports.clear();
    }
    /**
     * For any diagnostic with a code, offers two quick-fix actions:
     *   - "Disable {code} for this line": adds the code to an existing `bs:disable-line` or
     *     `bs:disable-next-line` directive on/above the diagnostic if present, otherwise inserts
     *     a new `bs:disable-next-line: {code}` comment on the line above.
     *   - "Disable {code} for this file": adds the code to an existing header-level `bs:disable`
     *     directive if present, otherwise inserts a new `bs:disable: {code}` at the top of the file.
     *
     * Comment placement and the line-vs-next-line preference are centralized here so they can be
     * revisited without touching the directive parser.
     */
    suggestDisableDiagnosticQuickFixes(diagnostic) {
        const code = diagnostic.code;
        if (code === undefined || code === null) {
            return;
        }
        const file = this.event.file;
        if (!(0, reflection_1.isBrsFile)(file) && !(0, reflection_1.isXmlFile)(file)) {
            return;
        }
        const codeStr = String(code);
        const isXml = (0, reflection_1.isXmlFile)(file);
        //existing.forLine: any line/next-line directive on or above the diagnostic line that the line action could extend
        //existing.forFile: any header-level bs:disable that the file action could extend
        const existing = this.findExistingDisableDirectives(file, diagnostic.range.start.line);
        //format helpers wrap the directive body in the right comment syntax (`'` for brs, `<!-- -->` for xml)
        const formatLineDirective = (token, codes) => {
            const body = `bs:disable-${token}: ${codes.join(' ')}`;
            return isXml ? `<!-- ${body} -->` : `' ${body}`;
        };
        const formatBlockDirective = (codes) => {
            const body = `bs:disable: ${codes.join(' ')}`;
            return isXml ? `<!-- ${body} -->` : `' ${body}`;
        };
        // ---- "disable for this line" ----
        //the two lambdas passed to getDiagnosticSuppressionChange are the "extend existing" and "insert fresh" branches:
        //  1) rebuild the existing directive comment with the new code merged into its code list (preserving line vs next-line)
        //  2) insert a fresh `bs:disable-next-line: {code}` on the line above the diagnostic, matching its indent
        const indent = ' '.repeat(diagnostic.range.start.character);
        const lineAction = this.getDiagnosticSuppressionChange(existing.forLine, codeStr, () => { var _a; return formatLineDirective(existing.forLine.type, this.mergeCodes((_a = existing.forLine) === null || _a === void 0 ? void 0 : _a.codes, codeStr)); }, () => ({
            position: util_1.util.createPosition(diagnostic.range.start.line, 0),
            newText: `${indent}${formatLineDirective('next-line', [codeStr])}\n`
        }));
        if (lineAction) {
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                title: `Disable ${code} for this line: ${diagnostic.message}`,
                diagnostics: [diagnostic],
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                changes: [lineAction]
            }));
        }
        // ---- "disable for this file" ----
        //same pattern as above, but operating on the header-level bs:disable directive:
        //  1) rebuild the existing header directive with the new code appended
        //  2) insert a fresh `bs:disable: {code}` at the file header (top of brs, or after `<?xml ?>` for xml)
        const fileAction = this.getDiagnosticSuppressionChange(existing.forFile, codeStr, () => { var _a; return formatBlockDirective(this.mergeCodes((_a = existing.forFile) === null || _a === void 0 ? void 0 : _a.codes, codeStr)); }, () => {
            const headerInsert = this.getDisableFileInsertion(file);
            return {
                position: headerInsert.position,
                newText: headerInsert.prefix + formatBlockDirective([codeStr]) + headerInsert.suffix
            };
        });
        if (fileAction) {
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                title: `Disable ${code} for this file: ${diagnostic.message}`,
                diagnostics: [diagnostic],
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                changes: [fileAction]
            }));
        }
    }
    /**
     * Returns the file change that suppresses `codeStr` via a directive comment, or `null` when no
     * change is needed (the existing directive already covers the code, or already suppresses
     * everything). When `existing` is set, the result is a replace that swaps the directive comment
     * for the text from `buildReplacementText`. When `existing` is null, the result is an insert
     * built from `buildInsert`.
     */
    getDiagnosticSuppressionChange(existing, codeStr, buildReplacementText, buildInsert) {
        if (existing) {
            //existing directive without specific codes already suppresses everything; no-op
            if (existing.codes.length === 0) {
                return null;
            }
            //the new code is already in the directive; no-op
            if (existing.codes.some(c => c.toLowerCase() === codeStr.toLowerCase())) {
                return null;
            }
            return {
                type: 'replace',
                filePath: this.event.file.srcPath,
                range: existing.range,
                newText: buildReplacementText()
            };
        }
        const insert = buildInsert();
        return {
            type: 'insert',
            filePath: this.event.file.srcPath,
            position: insert.position,
            newText: insert.newText
        };
    }
    mergeCodes(existingCodes, newCode) {
        return [...(existingCodes !== null && existingCodes !== void 0 ? existingCodes : []), newCode];
    }
    /**
     * Walks the file's tokens and returns existing `bs:disable-{line,next-line}` and header-level
     * `bs:disable` directives that would cover the diagnostic on `diagLine`. Used so the suppression
     * quick fixes can extend an existing directive instead of stacking new ones.
     */
    findExistingDisableDirectives(file, diagLine) {
        var _a, _b, _c, _d;
        const isXml = (0, reflection_1.isXmlFile)(file);
        const tokens = (_b = (_a = file.parser) === null || _a === void 0 ? void 0 : _a.tokens) !== null && _b !== void 0 ? _b : [];
        let inHeader = true;
        let forLine = null;
        let forFile = null;
        for (const token of tokens) {
            const isComment = isXml ? ((_c = token.tokenType) === null || _c === void 0 ? void 0 : _c.name) === 'Comment' : token.kind === TokenKind_1.TokenKind.Comment;
            if (!isComment) {
                if (isXml) {
                    if (((_d = token.tokenType) === null || _d === void 0 ? void 0 : _d.name) === 'OPEN') {
                        inHeader = false;
                    }
                }
                else if (token.kind !== TokenKind_1.TokenKind.Newline && token.kind !== TokenKind_1.TokenKind.Whitespace && token.kind !== TokenKind_1.TokenKind.Eof) {
                    inHeader = false;
                }
                continue;
            }
            const tokenRange = isXml ? (0, SGParser_1.rangeFromTokenValue)(token) : token.range;
            const tokenText = isXml ? token.image : token.text;
            const parsed = parseDisableComment(tokenText);
            if (!parsed) {
                continue;
            }
            const directive = { type: parsed.directiveType, codes: parsed.codes, range: tokenRange };
            if (!forLine && parsed.directiveType === 'line' && tokenRange.start.line === diagLine) {
                forLine = directive;
            }
            else if (!forLine && parsed.directiveType === 'next-line' && tokenRange.start.line === diagLine - 1) {
                forLine = directive;
            }
            else if (!forFile && parsed.directiveType === 'block' && inHeader) {
                //only header-level `bs:disable` directives are extended for the file-level quick fix
                forFile = directive;
            }
        }
        return { forLine: forLine, forFile: forFile };
    }
    /**
     * Decides where in the file a header-level `bs:disable` directive should be inserted, returning
     * the position plus any prefix/suffix needed so the directive lands on its own line in
     * the header (before the first executable statement / root XML element).
     */
    getDisableFileInsertion(file) {
        var _a;
        if ((0, reflection_1.isXmlFile)(file)) {
            //insert after the `<?xml ?>` declaration if present, otherwise at the very top
            const declCloseToken = (_a = file.parser.tokens) === null || _a === void 0 ? void 0 : _a.find(t => { var _a; return ((_a = t.tokenType) === null || _a === void 0 ? void 0 : _a.name) === 'SPECIAL_CLOSE'; });
            if (declCloseToken) {
                const endLine = declCloseToken.endLine - 1;
                const endColumn = declCloseToken.endColumn;
                return {
                    position: util_1.util.createPosition(endLine, endColumn),
                    prefix: '\n',
                    suffix: ''
                };
            }
        }
        return {
            position: util_1.util.createPosition(0, 0),
            prefix: '',
            suffix: '\n'
        };
    }
    /**
     * Builds a map of diagnostic code → all matching diagnostics in the current file for each
     * code in `eventCodes`. Scope-level codes are not present in `file.getDiagnostics()` so they
     * are sourced from `program.getDiagnostics()` (fetched lazily, only when needed).
     */
    collectFixAllDiagnostics(eventCodes) {
        var _a;
        const scopeLevelCodes = new Set([
            DiagnosticMessages_1.DiagnosticCodeMap.referencedFileDoesNotExist,
            DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryScriptImportInChildFromParent,
            DiagnosticMessages_1.DiagnosticCodeMap.scriptImportCaseMismatch,
            DiagnosticMessages_1.DiagnosticCodeMap.missingOverrideKeyword
        ]);
        const fileDiagsByCode = new Map();
        for (const d of this.event.file.getDiagnostics()) {
            if (!fileDiagsByCode.has(d.code)) {
                fileDiagsByCode.set(d.code, []);
            }
            fileDiagsByCode.get(d.code).push(d);
        }
        const allScopeFileDiags = [...eventCodes].some(c => scopeLevelCodes.has(c))
            ? this.event.program.getDiagnostics().filter(d => d.file === this.event.file)
            : [];
        const result = new Map();
        for (const code of eventCodes) {
            result.set(code, scopeLevelCodes.has(code)
                ? allScopeFileDiags.filter(d => d.code === code)
                : (_a = fileDiagsByCode.get(code)) !== null && _a !== void 0 ? _a : []);
        }
        return result;
    }
    /**
     * Generic import suggestion function. Shouldn't be called directly from the main loop, but instead called by more specific diagnostic handlers
     */
    suggestImportQuickFix(diagnostic, key, files) {
        var _a, _b, _c;
        //skip if we already have this suggestion
        if (this.suggestedImports.has(key)) {
            return;
        }
        this.suggestedImports.add(key);
        const importStatements = this.event.file.parser.references.importStatements;
        //find the position of the first import statement, or the top of the file if there is none
        const insertPosition = (_c = (_b = (_a = importStatements[importStatements.length - 1]) === null || _a === void 0 ? void 0 : _a.importToken.range) === null || _b === void 0 ? void 0 : _b.start) !== null && _c !== void 0 ? _c : util_1.util.createPosition(0, 0);
        //find all files that reference this function
        for (const file of files) {
            const pkgPath = util_1.util.getRokuPkgPath(file.pkgPath);
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                title: `import "${pkgPath}"`,
                diagnostics: [diagnostic],
                isPreferred: false,
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                changes: [{
                        type: 'insert',
                        filePath: this.event.file.srcPath,
                        position: insertPosition,
                        newText: `import "${pkgPath}"\n`
                    }]
            }));
        }
    }
    /**
     * Suggests import statements for an unresolved name (function, class, namespace, or enum).
     */
    suggestCannotFindNameQuickFix(diagnostic) {
        var _a;
        //skip if not a BrighterScript file
        if (diagnostic.file.parseMode !== Parser_1.ParseMode.BrighterScript) {
            return;
        }
        const lowerName = ((_a = diagnostic.data.fullName) !== null && _a !== void 0 ? _a : diagnostic.data.name).toLowerCase();
        this.suggestImportQuickFix(diagnostic, lowerName, [
            ...this.event.file.program.findFilesForFunction(lowerName),
            ...this.event.file.program.findFilesForClass(lowerName),
            ...this.event.file.program.findFilesForNamespace(lowerName),
            ...this.event.file.program.findFilesForEnum(lowerName)
        ]);
    }
    /**
     * Suggests import statements for an unresolved class name.
     */
    suggestClassImportQuickFix(diagnostic) {
        //skip if not a BrighterScript file
        if (diagnostic.file.parseMode !== Parser_1.ParseMode.BrighterScript) {
            return;
        }
        const lowerClassName = diagnostic.data.className.toLowerCase();
        this.suggestImportQuickFix(diagnostic, lowerClassName, this.event.file.program.findFilesForClass(lowerClassName));
    }
    /**
     * Scans all import-related diagnostics in the file and emits a single composite
     * "Fix all: Add missing imports" action when 2+ unambiguous imports are needed.
     * Ambiguous names (multiple possible source files) are excluded since we cannot
     * automatically choose one.
     */
    suggestMissingImportsFixAllQuickFix() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (!(0, reflection_1.isBrsFile)(this.event.file) || this.event.file.parseMode !== Parser_1.ParseMode.BrighterScript) {
            return;
        }
        const file = this.event.file;
        const importStatements = file.parser.references.importStatements;
        const insertPosition = (_c = (_b = (_a = importStatements[importStatements.length - 1]) === null || _a === void 0 ? void 0 : _a.importToken.range) === null || _b === void 0 ? void 0 : _b.start) !== null && _c !== void 0 ? _c : util_1.util.createPosition(0, 0);
        const changes = [];
        const addedPaths = new Set();
        // cannotFindName/classCouldNotBeFound are scope-level diagnostics, so we must
        // use program.getDiagnostics() (filtered by file) rather than file.getDiagnostics().
        const allFileDiagnostics = this.event.program.getDiagnostics().filter(d => d.file === file);
        for (const diagnostic of allFileDiagnostics) {
            let files = [];
            if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.cannotFindName || diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.cannotFindFunction) {
                const cannotFindNameDiagnostic = diagnostic;
                const lowerName = (_g = ((_e = (_d = cannotFindNameDiagnostic.data) === null || _d === void 0 ? void 0 : _d.fullName) !== null && _e !== void 0 ? _e : (_f = cannotFindNameDiagnostic.data) === null || _f === void 0 ? void 0 : _f.name)) === null || _g === void 0 ? void 0 : _g.toLowerCase();
                if (lowerName) {
                    files = [
                        ...file.program.findFilesForFunction(lowerName),
                        ...file.program.findFilesForClass(lowerName),
                        ...file.program.findFilesForNamespace(lowerName),
                        ...file.program.findFilesForEnum(lowerName)
                    ];
                }
            }
            else if (diagnostic.code === DiagnosticMessages_1.DiagnosticCodeMap.classCouldNotBeFound) {
                const classCouldNotBeFoundDiagnostic = diagnostic;
                const lowerClassName = (_j = (_h = classCouldNotBeFoundDiagnostic.data) === null || _h === void 0 ? void 0 : _h.className) === null || _j === void 0 ? void 0 : _j.toLowerCase();
                if (lowerClassName) {
                    files = file.program.findFilesForClass(lowerClassName);
                }
            }
            //skip ambiguous names; we can't choose a file automatically
            if (files.length !== 1) {
                continue;
            }
            const pkgPath = util_1.util.getRokuPkgPath(files[0].pkgPath);
            if (!addedPaths.has(pkgPath)) {
                addedPaths.add(pkgPath);
                changes.push({
                    type: 'insert',
                    filePath: file.srcPath,
                    position: insertPosition,
                    newText: `import "${pkgPath}"\n`
                });
            }
        }
        if (changes.length > 1) {
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                title: `Fix all: Auto fixable missing imports`,
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                changes: changes
            }));
        }
    }
    /**
     * Adds code actions to insert a missing `extends` attribute on an XML component tag.
     * Offers Group, Task, and ContentNode as common choices.
     */
    suggestMissingExtendsQuickFix(diagnostic) {
        const srcPath = this.event.file.srcPath;
        const pos = (0, codeActionHelpers_1.getMissingExtendsInsertPosition)(this.event.file);
        this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
            title: `Extend "Group"`,
            diagnostics: [diagnostic],
            isPreferred: true,
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            changes: [{
                    type: 'insert',
                    filePath: srcPath,
                    position: pos,
                    newText: ' extends="Group"'
                }]
        }));
        this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
            title: `Extend "Task"`,
            diagnostics: [diagnostic],
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            changes: [{
                    type: 'insert',
                    filePath: srcPath,
                    position: pos,
                    newText: ' extends="Task"'
                }]
        }));
        this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
            title: `Extend "ContentNode"`,
            diagnostics: [diagnostic],
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            changes: [{
                    type: 'insert',
                    filePath: srcPath,
                    position: pos,
                    newText: ' extends="ContentNode"'
                }]
        }));
    }
    /**
     * Adds code actions to resolve a `voidFunctionMayNotReturnValue` diagnostic.
     * Offers removing the return value, converting sub→function, or removing an `as void` return type.
     */
    suggestVoidFunctionReturnQuickFixes(diagnostics) {
        var _a, _b, _c, _d;
        const changes = diagnostics.map(d => this.getRemoveReturnValueChange(d));
        this.emitOrFixAll(`Remove return value`, `Fix all: Remove void return values`, changes, diagnostics[0]);
        //contextual BrsFile actions only apply to the individual (single-violation) case
        if (changes.length === 1 && (0, reflection_1.isBrsFile)(this.event.file)) {
            const diagnostic = diagnostics[0];
            const expression = this.event.file.getClosestExpression(diagnostic.range.start);
            const func = expression.findAncestor(reflection_1.isFunctionExpression);
            //if we're in a sub and we do not have a return type, suggest converting to a function
            if (func.functionType.kind === TokenKind_1.TokenKind.Sub && !func.returnTypeToken) {
                //find the first function in a file that uses the `function` keyword
                const referenceFunction = this.event.file.parser.ast.findChild((node) => {
                    return (0, reflection_1.isFunctionExpression)(node) && node.functionType.kind === TokenKind_1.TokenKind.Function;
                });
                const functionTypeText = (_a = referenceFunction === null || referenceFunction === void 0 ? void 0 : referenceFunction.functionType.text) !== null && _a !== void 0 ? _a : 'function';
                const endFunctionTypeText = (_c = (_b = referenceFunction === null || referenceFunction === void 0 ? void 0 : referenceFunction.end) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : 'end function';
                this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                    title: `Convert ${func.functionType.text} to ${functionTypeText}`,
                    diagnostics: [diagnostic],
                    kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                    changes: [
                        //function
                        { type: 'replace', filePath: this.event.file.srcPath, range: func.functionType.range, newText: functionTypeText },
                        //end function
                        { type: 'replace', filePath: this.event.file.srcPath, range: func.end.range, newText: endFunctionTypeText }
                    ]
                }));
            }
            //function `as void` return type. Suggest removing the return type
            if (func.functionType.kind === TokenKind_1.TokenKind.Function && ((_d = func.returnTypeToken) === null || _d === void 0 ? void 0 : _d.kind) === TokenKind_1.TokenKind.Void) {
                this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                    title: `Remove return type from function declaration`,
                    diagnostics: [diagnostic],
                    kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                    changes: [this.getRemoveFunctionReturnTypeChange(func)]
                }));
            }
        }
    }
    /**
     * Adds code actions to resolve a `nonVoidFunctionMustReturnValue` diagnostic.
     * Offers removing the return type from a sub, adding `as void` to a function, or converting function→sub.
     */
    suggestNonVoidFunctionReturnQuickFixes(diagnostics) {
        if (!(0, reflection_1.isBrsFile)(this.event.file)) {
            return;
        }
        const file = this.event.file;
        //find tokens for `as`, `void`, `sub`, `end sub` in the file if possible
        let asText;
        let voidText;
        let subText;
        let endSubText;
        for (const token of file.parser.tokens) {
            if (asText && voidText && subText && endSubText) {
                break;
            }
            if ((token === null || token === void 0 ? void 0 : token.kind) === TokenKind_1.TokenKind.As) {
                asText = token === null || token === void 0 ? void 0 : token.text;
            }
            else if ((token === null || token === void 0 ? void 0 : token.kind) === TokenKind_1.TokenKind.Void) {
                voidText = token === null || token === void 0 ? void 0 : token.text;
            }
            else if ((token === null || token === void 0 ? void 0 : token.kind) === TokenKind_1.TokenKind.Sub) {
                subText = token === null || token === void 0 ? void 0 : token.text;
            }
            else if ((token === null || token === void 0 ? void 0 : token.kind) === TokenKind_1.TokenKind.EndSub) {
                endSubText = token === null || token === void 0 ? void 0 : token.text;
            }
        }
        // Build per-fix-type change arrays, deduplicating by enclosing function so that one
        // function with multiple bare returns only contributes one change.
        const removeReturnTypeChanges = [];
        const addVoidChanges = [];
        const seenFunctions = new Set();
        for (const d of diagnostics) {
            const expr = file.getClosestExpression(d.range.start);
            const fn = expr === null || expr === void 0 ? void 0 : expr.findAncestor(reflection_1.isFunctionExpression);
            if (!fn) {
                continue;
            }
            const fnKey = `${fn.range.start.line}:${fn.range.start.character}`;
            if (seenFunctions.has(fnKey)) {
                continue;
            }
            seenFunctions.add(fnKey);
            if (fn.functionType.kind === TokenKind_1.TokenKind.Sub && fn.returnTypeToken && fn.returnTypeToken.kind !== TokenKind_1.TokenKind.Void) {
                removeReturnTypeChanges.push(this.getRemoveFunctionReturnTypeChange(fn));
            }
            else if (fn.functionType.kind === TokenKind_1.TokenKind.Function && !fn.returnTypeToken) {
                addVoidChanges.push({
                    type: 'insert',
                    filePath: this.event.file.srcPath,
                    position: fn.rightParen.range.end,
                    newText: ` ${asText !== null && asText !== void 0 ? asText : 'as'} ${voidText !== null && voidText !== void 0 ? voidText : 'void'}`
                });
            }
        }
        this.emitOrFixAll(`Remove return type from sub declaration`, `Fix all: Remove return type from sub declarations`, removeReturnTypeChanges, diagnostics[0]);
        this.emitOrFixAll(`Add void return type to function declaration`, `Fix all: Add void return type to function declarations`, addVoidChanges, diagnostics[0]);
        //'Convert function to sub' has no fix-all variant; only add it for the individual case
        if (addVoidChanges.length === 1 && diagnostics.length === 1) {
            const func = file.getClosestExpression(diagnostics[0].range.start).findAncestor(reflection_1.isFunctionExpression);
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction({
                title: `Convert function to sub`,
                diagnostics: [diagnostics[0]],
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                changes: [
                    { type: 'replace', filePath: file.srcPath, range: func.functionType.range, newText: subText !== null && subText !== void 0 ? subText : 'sub' },
                    { type: 'replace', filePath: file.srcPath, range: func.end.range, newText: endSubText !== null && endSubText !== void 0 ? endSubText : 'end sub' }
                ]
            }));
        }
    }
    // ---- script import fixes ----
    /**
     * Adds code actions to delete one or more unnecessary or broken script import lines.
     */
    suggestRemoveScriptImportQuickFixes(diagnostics) {
        var _a, _b;
        const titles = {
            [DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryScriptImportInChildFromParent]: ['Remove redundant script import', 'Fix all: Remove redundant script imports'],
            [DiagnosticMessages_1.DiagnosticCodeMap.unnecessaryCodebehindScriptImport]: ['Remove unnecessary codebehind import', 'Fix all: Remove unnecessary codebehind imports']
        };
        const [singleTitle, fixAllTitle] = (_b = titles[(_a = diagnostics[0]) === null || _a === void 0 ? void 0 : _a.code]) !== null && _b !== void 0 ? _b : ['Remove script import', 'Fix all: Remove script imports'];
        const changes = diagnostics.map(diagnostic => {
            return {
                type: 'delete',
                filePath: this.event.file.srcPath,
                range: util_1.util.createRange(diagnostic.range.start.line, 0, diagnostic.range.start.line + 1, 0)
            };
        });
        this.emitOrFixAll(singleTitle, fixAllTitle, changes, diagnostics[0]);
    }
    /**
     * Adds code actions to correct the casing of script import paths to match the actual file name on disk.
     */
    suggestScriptImportCasingQuickFixes(diagnostics) {
        var _a;
        const changes = [];
        for (const diagnostic of diagnostics) {
            const correctFilePath = (_a = diagnostic.data) === null || _a === void 0 ? void 0 : _a.correctFilePath;
            if (!correctFilePath) {
                continue;
            }
            changes.push({
                type: 'replace',
                filePath: this.event.file.srcPath,
                range: diagnostic.range,
                newText: correctFilePath
            });
        }
        this.emitOrFixAll('Fix script import path casing', 'Fix all: Fix script import path casing', changes, diagnostics[0]);
    }
    // ---- override keyword fixes ----
    /**
     * Adds code actions to insert the missing `override` keyword before a method declaration.
     */
    suggestMissingOverrideQuickFixes(diagnostics) {
        if (!(0, reflection_1.isBrsFile)(this.event.file)) {
            return;
        }
        const file = this.event.file;
        const changes = [];
        for (const diagnostic of diagnostics) {
            let insertPosition;
            file.ast.walk((node) => {
                var _a, _b, _c, _d, _e, _f;
                if ((0, reflection_1.isMethodStatement)(node) &&
                    ((_b = (_a = node.range) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.line) === diagnostic.range.start.line &&
                    ((_d = (_c = node.range) === null || _c === void 0 ? void 0 : _c.start) === null || _d === void 0 ? void 0 : _d.character) === diagnostic.range.start.character) {
                    insertPosition = (_f = (_e = node.func.functionType) === null || _e === void 0 ? void 0 : _e.range) === null || _f === void 0 ? void 0 : _f.start;
                }
            }, { walkMode: visitors_1.WalkMode.visitStatementsRecursive });
            if (insertPosition) {
                changes.push({
                    type: 'insert',
                    filePath: file.srcPath,
                    position: insertPosition,
                    newText: 'override '
                });
            }
        }
        this.emitOrFixAll(`Add missing 'override' keyword`, `Fix all: Add missing 'override' keywords`, changes, diagnostics[0]);
    }
    /**
     * Adds one code action per legal terminator. The first entry of `expected` is marked
     * `isPreferred`, matching the parser's convention of listing the canonical terminator first.
     */
    suggestMismatchedEndingTokenQuickFixes(diagnostics) {
        const { expected, found } = diagnostics[0].data;
        for (let index = 0; index < expected.length; index++) {
            const replacement = expected[index];
            const changes = diagnostics.map(diagnostic => ({
                type: 'replace',
                filePath: this.event.file.srcPath,
                range: diagnostic.range,
                newText: replacement
            }));
            this.emitOrFixAll(`Convert '${found}' to '${replacement}'`, `Fix all: Convert '${found}' to '${replacement}'`, changes, diagnostics[0], index === 0);
        }
    }
    /**
     * Adds code actions to remove the invalid `override` keyword from a constructor method.
     */
    suggestRemoveOverrideFromConstructorQuickFixes(diagnostics) {
        const changes = diagnostics.map(d => ({
            type: 'delete',
            filePath: this.event.file.srcPath,
            // delete "override " (the keyword token plus the trailing space before function/sub)
            range: util_1.util.createRange(d.range.start.line, d.range.start.character, d.range.end.line, d.range.end.character + 1)
        }));
        this.emitOrFixAll(`Remove 'override' from constructor`, `Fix all: Remove 'override' from constructors`, changes, diagnostics[0]);
    }
    // ---- change helpers ----
    /**
     * Builds a delete change that removes the return value from a `return <expr>` statement,
     * leaving just a bare `return`.
     */
    getRemoveReturnValueChange(diagnostic) {
        return {
            type: 'delete',
            filePath: this.event.file.srcPath,
            range: util_1.util.createRange(diagnostic.range.start.line, diagnostic.range.start.character + 'return'.length, diagnostic.range.end.line, diagnostic.range.end.character)
        };
    }
    /**
     * Builds the change that deletes `) as <type>` from a function/sub declaration.
     * Used for both `as void` on a function and any return type on a sub.
     */
    getRemoveFunctionReturnTypeChange(func) {
        return {
            type: 'delete',
            filePath: this.event.file.srcPath,
            // )| as <type>|
            range: util_1.util.createRange(func.rightParen.range.start.line, func.rightParen.range.start.character + 1, func.returnTypeToken.range.end.line, func.returnTypeToken.range.end.character)
        };
    }
    /**
     * Emits a single code action when there is exactly one change, or a "fix all" composite
     * action when there are multiple changes (same pattern as ESLint's "Fix all X problems").
     * Does nothing when the changes array is empty.
     */
    emitOrFixAll(singleTitle, fixAllTitle, changes, diagnostic, isPreferred) {
        if (changes.length === 0) {
            return;
        }
        if (changes.length === 1) {
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction(Object.assign(Object.assign({ title: singleTitle, diagnostics: [diagnostic] }, (isPreferred ? { isPreferred: true } : {})), { kind: vscode_languageserver_1.CodeActionKind.QuickFix, changes: changes })));
        }
        else {
            this.event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction(Object.assign(Object.assign({ title: fixAllTitle }, (isPreferred ? { isPreferred: true } : {})), { kind: vscode_languageserver_1.CodeActionKind.QuickFix, changes: changes })));
        }
    }
}
exports.CodeActionsProcessor = CodeActionsProcessor;
/**
 * Parses a comment's text and returns the directive details if it is one. Recognizes
 * `'`, `rem`, and `<!-- -->` comment styles. Returns `null` for comments that aren't directives.
 * `block` covers `bs:disable`. The `bs:enable` partner isn't surfaced since the quick fix only
 * extends `bs:disable` directives.
 */
function parseDisableComment(text) {
    let inner = text;
    if (inner.startsWith('<!--')) {
        inner = inner.slice('<!--'.length);
        if (inner.endsWith('-->')) {
            inner = inner.slice(0, -('-->'.length));
        }
    }
    else if (inner.startsWith(`'`)) {
        inner = inner.slice(1);
    }
    else if (/^rem\b/i.test(inner)) {
        inner = inner.slice('rem'.length);
    }
    inner = inner.trimStart();
    const lower = inner.toLowerCase();
    //match longest-prefix first so `bs:disable-line` doesn't get parsed as `bs:disable`
    let directiveType;
    let prefixLength;
    if (lower.startsWith('bs:disable-next-line')) {
        directiveType = 'next-line';
        prefixLength = 'bs:disable-next-line'.length;
    }
    else if (lower.startsWith('bs:disable-line')) {
        directiveType = 'line';
        prefixLength = 'bs:disable-line'.length;
    }
    else if (lower.startsWith('bs:disable')) {
        directiveType = 'block';
        prefixLength = 'bs:disable'.length;
    }
    else {
        return null;
    }
    inner = inner.slice(prefixLength);
    if (inner.startsWith(':')) {
        inner = inner.slice(1);
    }
    const codes = inner.trim().length === 0 ? [] : inner.trim().split(/\s+/);
    return { directiveType: directiveType, codes: codes };
}
//# sourceMappingURL=CodeActionsProcessor.js.map