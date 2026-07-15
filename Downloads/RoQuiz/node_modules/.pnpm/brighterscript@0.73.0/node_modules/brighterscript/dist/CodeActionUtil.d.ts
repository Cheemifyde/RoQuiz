import type { Diagnostic, Position, Range } from 'vscode-languageserver';
import { CodeActionKind, CodeAction } from 'vscode-languageserver';
export declare class CodeActionUtil {
    createCodeAction(obj: CodeActionShorthand): CodeAction;
    serializableDiagnostics(diagnostics: Diagnostic[] | undefined): {
        range: Range;
        severity: import("vscode-languageserver-types").DiagnosticSeverity;
        source: string;
        code: string | number;
        message: string;
        relatedInformation: import("vscode-languageserver-types").DiagnosticRelatedInformation[];
    }[];
}
export { CodeActionKind };
export interface CodeActionShorthand {
    title: string;
    diagnostics?: Diagnostic[];
    kind?: CodeActionKind;
    isPreferred?: boolean;
    changes: Array<InsertChange | ReplaceChange | DeleteChange>;
}
/**
 * Represents a single named "source fix all" action that a plugin contributes.
 * Each action becomes a separate entry in VS Code's Source Actions menu.
 * Plugins are responsible for merging all their changes into the `changes` array.
 */
export interface SourceFixAllCodeAction {
    title: string;
    /**
     * The LSP code action kind. Should start with `source.fixAll`.
     * Use a sub-kind like `source.fixAll.brighterscript.imports` to create
     * a distinct named entry in the Source Actions menu.
     * Defaults to `source.fixAll.brighterscript`.
     */
    kind?: string;
    isPreferred?: boolean;
    changes: Array<InsertChange | ReplaceChange | DeleteChange>;
}
export interface InsertChange {
    filePath: string;
    newText: string;
    type: 'insert';
    position: Position;
}
export interface ReplaceChange {
    filePath: string;
    newText: string;
    type: 'replace';
    range: Range;
}
export interface DeleteChange {
    filePath: string;
    type: 'delete';
    range: Range;
}
export declare const codeActionUtil: CodeActionUtil;
