"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoveReturnValueChange = exports.getMissingExtendsInsertPosition = void 0;
const util_1 = require("../../util");
/**
 * Returns the position at which an `extends` attribute should be inserted for
 * a component that is missing one: after the last existing attribute, or after
 * the `<component` tag itself if there are no attributes yet.
 */
function getMissingExtendsInsertPosition(file) {
    var _a;
    const { component } = file.parser.ast;
    return ((_a = component.attributes[component.attributes.length - 1]) !== null && _a !== void 0 ? _a : component.tag).range.end;
}
exports.getMissingExtendsInsertPosition = getMissingExtendsInsertPosition;
/**
 * Returns the delete change that removes the return value from a `return <expr>`
 * statement flagged by `voidFunctionMayNotReturnValue`. Leaves the bare `return`
 * keyword in place.
 */
function getRemoveReturnValueChange(diagnostic, filePath) {
    return {
        type: 'delete',
        filePath: filePath,
        range: util_1.util.createRange(diagnostic.range.start.line, diagnostic.range.start.character + 'return'.length, diagnostic.range.end.line, diagnostic.range.end.character)
    };
}
exports.getRemoveReturnValueChange = getRemoveReturnValueChange;
//# sourceMappingURL=codeActionHelpers.js.map