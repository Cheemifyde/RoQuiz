import type { BrsFile } from '../../files/BrsFile';
import type { OnScopeValidateEvent } from '../../interfaces';
/**
 * A validator that handles all scope validations for a program validation cycle.
 * You should create ONE of these to handle all scope events between beforeProgramValidate and afterProgramValidate,
 * and call reset() before using it again in the next cycle
 */
export declare class ScopeValidator {
    /**
     * The event currently being processed. This will change multiple times throughout the lifetime of this validator
     */
    private event;
    processEvent(event: OnScopeValidateEvent): void;
    reset(): void;
    private walkFiles;
    private validateComputedAAKeys;
    /**
     * Recursively resolve a const/enum reference to determine if its ultimate value is a string.
     * Returns true only if the value is confirmed to be a string.
     */
    private constResolvesToString;
    private expressionsByFile;
    private iterateFileExpressions;
    /**
     * Given a string optionally separated by dots, find an enum related to it.
     * For example, all of these would return the enum: `SomeNamespace.SomeEnum.SomeMember`, SomeEnum.SomeMember, `SomeEnum`
     */
    private getEnum;
    /**
     * Flag duplicate enums
     */
    private detectDuplicateEnums;
    /**
     * Flag circular references between consts (e.g. const A = B; const B = A, or
     * aggregate cycles like const A = { x: B }; const B = { y: A }). Without this
     * check, the transpile pass silently emits unresolved refs at the cycle break
     * point, producing code that fails at runtime.
     *
     * Mirrors the existing class-hierarchy circular-reference detection: each const
     * starts its own walk, and an N-cycle produces N diagnostics (one rooted at
     * each member of the cycle).
     */
    private detectCircularConstReferences;
    /**
     * Validate every function call to `CreateObject`.
     * Ideally we would create better type checking/handling for this, but in the mean time, we know exactly
     * what these calls are supposed to look like, and this is a very common thing for brs devs to do, so just
     * do this manually for now.
     */
    protected validateCreateObjectCalls(file: BrsFile): void;
    /**
     * Adds a diagnostic to the first scope for this key. Prevents duplicate diagnostics
     * for diagnostics where scope isn't important. (i.e. CreateObject validations)
     */
    private addDiagnosticOnce;
    private onceCache;
    private addDiagnostic;
    /**
     * Add a diagnostic (to the first scope) that will have `relatedInformation` for each affected scope
     */
    private addMultiScopeDiagnostic;
    private multiScopeCache;
}
