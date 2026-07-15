import type { Range } from 'vscode-languageserver';
import type { BscFile, BsDiagnostic, CommentFlag, DiagnosticCode } from './interfaces';
export declare class CommentFlagProcessor {
    /**
     * The file this processor applies to
     */
    file: BscFile;
    /**
     * An array of strings containing the types of text that a comment starts with. (i.e. `REM`, `'`, `<!--`)
     */
    commentStarters: string[];
    /**
     * Valid diagnostic codes. Codes NOT in this list will be flagged
     */
    diagnosticCodes: DiagnosticCode[];
    constructor(
    /**
     * The file this processor applies to
     */
    file: BscFile, 
    /**
     * An array of strings containing the types of text that a comment starts with. (i.e. `REM`, `'`, `<!--`)
     */
    commentStarters?: string[], 
    /**
     * Valid diagnostic codes. Codes NOT in this list will be flagged
     */
    diagnosticCodes?: DiagnosticCode[]);
    /**
     * List of comment flags generated during processing
     */
    commentFlags: CommentFlag[];
    /**
     * List of diagnostics generated during processing
     */
    diagnostics: BsDiagnostic[];
    /**
     * Block-level `bs:disable` / `bs:enable` directives, recorded in source order
     * by `tryAdd` and resolved into `CommentFlag`s by `finalize()`.
     */
    private blockDirectives;
    tryAdd(text: string, range: Range): void;
    /**
     * Resolve any pending `bs:disable` / `bs:enable` block directives into `CommentFlag`s.
     * Must be called after the file's comment tokens have been fed through `tryAdd`.
     */
    finalize(): void;
    /**
     * Resolve a list of `{ code, range }` tokens into validated diagnostic codes.
     * Pushes diagnostics for any unknown numeric codes. Returns `null` when no codes were specified
     * (i.e. a bare `bs:disable` / `bs:enable`), and an array otherwise.
     */
    private collectCodes;
    /**
     * Small tokenizer for `bs:` directive comments.
     */
    private tokenize;
    /**
     * Given a string, extract each item split by whitespace
     * @param text the text to tokenize
     */
    private tokenizeByWhitespace;
}
