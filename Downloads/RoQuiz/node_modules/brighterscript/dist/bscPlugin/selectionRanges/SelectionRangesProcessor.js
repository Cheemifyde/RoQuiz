"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionRangesProcessor = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const reflection_1 = require("../../astUtils/reflection");
class SelectionRangesProcessor {
    constructor(event) {
        this.event = event;
    }
    process() {
        if (!(0, reflection_1.isBrsFile)(this.event.file)) {
            return;
        }
        for (const position of this.event.positions) {
            const selectionRange = this.buildSelectionRange(position);
            if (selectionRange) {
                this.event.selectionRanges.push(selectionRange);
            }
        }
    }
    buildSelectionRange(position) {
        const file = this.event.file;
        if (!(0, reflection_1.isBrsFile)(file)) {
            return undefined;
        }
        // Find the deepest AST node containing this position
        const innerNode = file.ast.findChildAtPosition(position);
        if (!(innerNode === null || innerNode === void 0 ? void 0 : innerNode.range)) {
            return undefined;
        }
        const ranges = [];
        // Many BrightScript AST nodes store identifier names as raw Tokens (not child
        // AstNodes), so findChildAtPosition stops at the enclosing statement/expression.
        // To give the first expansion step a tight "identifier only" range — matching
        // the JS/TS smart-select behaviour — we look up the exact lexer token at the
        // cursor position and use its range as the initial step.
        const token = file.getTokenAt(position);
        if ((token === null || token === void 0 ? void 0 : token.range) && !rangesEqual(token.range, innerNode.range)) {
            ranges.push(token.range);
        }
        // Walk up the AST parent chain, collecting each node's range.
        // Skip duplicate consecutive ranges (e.g. a Block whose range equals its
        // only child statement, or an ExpressionStatement === its expression).
        let node = innerNode;
        while (node) {
            const nodeRange = node.range;
            if (nodeRange && !rangesEqual(nodeRange, ranges[ranges.length - 1])) {
                ranges.push(nodeRange);
            }
            node = node.parent;
        }
        if (ranges.length === 0) {
            return undefined;
        }
        // Build the SelectionRange linked list from outermost → innermost.
        // LSP: the innermost range has `.parent` pointing outward.
        let selectionRange;
        for (let i = ranges.length - 1; i >= 0; i--) {
            selectionRange = vscode_languageserver_types_1.SelectionRange.create(ranges[i], selectionRange);
        }
        return selectionRange;
    }
}
exports.SelectionRangesProcessor = SelectionRangesProcessor;
function rangesEqual(a, b) {
    if (!a || !b) {
        return false;
    }
    return a.start.line === b.start.line &&
        a.start.character === b.start.character &&
        a.end.line === b.end.line &&
        a.end.character === b.end.character;
}
//# sourceMappingURL=SelectionRangesProcessor.js.map