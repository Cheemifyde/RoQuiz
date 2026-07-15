import type { Diagnostic } from 'vscode-languageserver';
import type { XmlFile } from '../../files/XmlFile';
/**
 * Returns the position at which an `extends` attribute should be inserted for
 * a component that is missing one: after the last existing attribute, or after
 * the `<component` tag itself if there are no attributes yet.
 */
export declare function getMissingExtendsInsertPosition(file: XmlFile): import("vscode-languageserver-types").Position;
/**
 * Returns the delete change that removes the return value from a `return <expr>`
 * statement flagged by `voidFunctionMayNotReturnValue`. Leaves the bare `return`
 * keyword in place.
 */
export declare function getRemoveReturnValueChange(diagnostic: Diagnostic, filePath: string): {
    type: "delete";
    filePath: string;
    range: import("vscode-languageserver-types").Range;
};
