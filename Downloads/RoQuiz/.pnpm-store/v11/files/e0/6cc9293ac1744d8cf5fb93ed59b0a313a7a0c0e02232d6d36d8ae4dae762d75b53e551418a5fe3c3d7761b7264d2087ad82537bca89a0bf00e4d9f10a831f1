import type { OnGetCodeActionsEvent } from '../../interfaces';
export declare class CodeActionsProcessor {
    event: OnGetCodeActionsEvent;
    constructor(event: OnGetCodeActionsEvent);
    /**
     * Processes all diagnostics in the event and emits code actions for each recognized diagnostic code.
     */
    process(): void;
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
    private suggestDisableDiagnosticQuickFixes;
    /**
     * Returns the file change that suppresses `codeStr` via a directive comment, or `null` when no
     * change is needed (the existing directive already covers the code, or already suppresses
     * everything). When `existing` is set, the result is a replace that swaps the directive comment
     * for the text from `buildReplacementText`. When `existing` is null, the result is an insert
     * built from `buildInsert`.
     */
    private getDiagnosticSuppressionChange;
    private mergeCodes;
    /**
     * Walks the file's tokens and returns existing `bs:disable-{line,next-line}` and header-level
     * `bs:disable` directives that would cover the diagnostic on `diagLine`. Used so the suppression
     * quick fixes can extend an existing directive instead of stacking new ones.
     */
    private findExistingDisableDirectives;
    /**
     * Decides where in the file a header-level `bs:disable` directive should be inserted, returning
     * the position plus any prefix/suffix needed so the directive lands on its own line in
     * the header (before the first executable statement / root XML element).
     */
    private getDisableFileInsertion;
    /**
     * Builds a map of diagnostic code → all matching diagnostics in the current file for each
     * code in `eventCodes`. Scope-level codes are not present in `file.getDiagnostics()` so they
     * are sourced from `program.getDiagnostics()` (fetched lazily, only when needed).
     */
    private collectFixAllDiagnostics;
    private suggestedImports;
    /**
     * Generic import suggestion function. Shouldn't be called directly from the main loop, but instead called by more specific diagnostic handlers
     */
    private suggestImportQuickFix;
    /**
     * Suggests import statements for an unresolved name (function, class, namespace, or enum).
     */
    private suggestCannotFindNameQuickFix;
    /**
     * Suggests import statements for an unresolved class name.
     */
    private suggestClassImportQuickFix;
    /**
     * Scans all import-related diagnostics in the file and emits a single composite
     * "Fix all: Add missing imports" action when 2+ unambiguous imports are needed.
     * Ambiguous names (multiple possible source files) are excluded since we cannot
     * automatically choose one.
     */
    private suggestMissingImportsFixAllQuickFix;
    /**
     * Adds code actions to insert a missing `extends` attribute on an XML component tag.
     * Offers Group, Task, and ContentNode as common choices.
     */
    private suggestMissingExtendsQuickFix;
    /**
     * Adds code actions to resolve a `voidFunctionMayNotReturnValue` diagnostic.
     * Offers removing the return value, converting sub→function, or removing an `as void` return type.
     */
    private suggestVoidFunctionReturnQuickFixes;
    /**
     * Adds code actions to resolve a `nonVoidFunctionMustReturnValue` diagnostic.
     * Offers removing the return type from a sub, adding `as void` to a function, or converting function→sub.
     */
    private suggestNonVoidFunctionReturnQuickFixes;
    /**
     * Adds code actions to delete one or more unnecessary or broken script import lines.
     */
    private suggestRemoveScriptImportQuickFixes;
    /**
     * Adds code actions to correct the casing of script import paths to match the actual file name on disk.
     */
    private suggestScriptImportCasingQuickFixes;
    /**
     * Adds code actions to insert the missing `override` keyword before a method declaration.
     */
    private suggestMissingOverrideQuickFixes;
    /**
     * Adds one code action per legal terminator. The first entry of `expected` is marked
     * `isPreferred`, matching the parser's convention of listing the canonical terminator first.
     */
    private suggestMismatchedEndingTokenQuickFixes;
    /**
     * Adds code actions to remove the invalid `override` keyword from a constructor method.
     */
    private suggestRemoveOverrideFromConstructorQuickFixes;
    /**
     * Builds a delete change that removes the return value from a `return <expr>` statement,
     * leaving just a bare `return`.
     */
    private getRemoveReturnValueChange;
    /**
     * Builds the change that deletes `) as <type>` from a function/sub declaration.
     * Used for both `as void` on a function and any return type on a sub.
     */
    private getRemoveFunctionReturnTypeChange;
    /**
     * Emits a single code action when there is exactly one change, or a "fix all" composite
     * action when there are multiple changes (same pattern as ESLint's "Fix all X problems").
     * Does nothing when the changes array is empty.
     */
    private emitOrFixAll;
}
