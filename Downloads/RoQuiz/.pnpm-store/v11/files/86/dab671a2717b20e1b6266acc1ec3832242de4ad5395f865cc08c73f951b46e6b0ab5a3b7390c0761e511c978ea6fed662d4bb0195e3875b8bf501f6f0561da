"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixAllCodeActionsProcessor = void 0;
const DiagnosticMessages_1 = require("../../DiagnosticMessages");
const reflection_1 = require("../../astUtils/reflection");
const codeActionHelpers_1 = require("./codeActionHelpers");
class FixAllCodeActionsProcessor {
    constructor(event) {
        this.event = event;
    }
    process() {
        const byCode = new Map();
        for (const diagnostic of this.event.diagnostics) {
            const key = diagnostic.code;
            if (!byCode.has(key)) {
                byCode.set(key, []);
            }
            byCode.get(key).push(diagnostic);
        }
        const missingExtends = byCode.get(DiagnosticMessages_1.DiagnosticCodeMap.xmlComponentMissingExtendsAttribute);
        if (missingExtends) {
            this.processMissingExtends(missingExtends);
        }
        const voidFunctionReturns = byCode.get(DiagnosticMessages_1.DiagnosticCodeMap.voidFunctionMayNotReturnValue);
        if (voidFunctionReturns) {
            this.processVoidFunctionReturnActions(voidFunctionReturns);
        }
    }
    /**
     * For every `voidFunctionMayNotReturnValue` diagnostic in this file,
     * remove the return value expression, leaving the bare `return` keyword.
     */
    processVoidFunctionReturnActions(diagnostics) {
        const changes = diagnostics.map(diagnostic => (0, codeActionHelpers_1.getRemoveReturnValueChange)(diagnostic, this.event.file.srcPath));
        this.event.actions.push({
            title: 'Remove all void return values',
            kind: 'source.fixAll.brighterscript',
            isPreferred: true,
            changes: changes
        });
    }
    /**
     * For every `xmlComponentMissingExtendsAttribute` diagnostic in this file,
     * insert `extends="Group"` — the same choice marked `isPreferred` in the
     * per-diagnostic quick-fix.
     */
    processMissingExtends(diagnostics) {
        if (!(0, reflection_1.isXmlFile)(this.event.file)) {
            return;
        }
        const changes = diagnostics.map(() => ({
            type: 'insert',
            filePath: this.event.file.srcPath,
            position: (0, codeActionHelpers_1.getMissingExtendsInsertPosition)(this.event.file),
            newText: ' extends="Group"'
        }));
        this.event.actions.push({
            title: 'Add missing extends attributes',
            kind: 'source.fixAll.brighterscript',
            isPreferred: true,
            changes: changes
        });
    }
}
exports.FixAllCodeActionsProcessor = FixAllCodeActionsProcessor;
//# sourceMappingURL=FixAllCodeActionsProcessor.js.map