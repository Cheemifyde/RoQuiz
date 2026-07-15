import type { BrsFile } from '../../files/BrsFile';
import type { OnFileValidateEvent } from '../../interfaces';
export declare class BrsFileValidator {
    event: OnFileValidateEvent<BrsFile>;
    constructor(event: OnFileValidateEvent<BrsFile>);
    process(): void;
    /**
     * Walk the full AST
     */
    private walk;
    /**
     * Validate that a statement is defined in one of these specific locations
     *  - the root of the AST
     *  - inside a namespace
     * This is applicable to things like FunctionStatement, ClassStatement, NamespaceStatement, EnumStatement, InterfaceStatement
     */
    private validateDeclarationLocations;
    private validateFunctionParameterCount;
    private validateEnumDeclaration;
    private validateEnumValueTypes;
    /**
     * Find statements defined at the top level (or inside a namespace body) that are not allowed to be there
     */
    private flagTopLevelStatements;
    private validateImportStatements;
    private validateContinueStatement;
    /**
     * Validate that there are no optional chaining operators on the left-hand-side of an assignment, indexed set, or dotted get
     */
    private validateNoOptionalChainingInVarSet;
    /**
     * Add a diagnostic if the configured minFirmwareVersion is lower than the version that
     * introduced optional chaining support (Roku OS 11).
     * This applies to both .brs and .bs files because optional chaining is not transpiled —
     * it is emitted as-is, so the target device must natively support it.
     */
    private validateMinFirmwareVersionForOptionalChaining;
    /**
     * For a bare top-level call to a known global callable, fire one deprecation/removal
     * diagnostic driven by `callable.availability`. The rsg axis takes precedence: if it
     * fires, the os axis is skipped entirely. The os axis is only consulted when rsg is
     * silent (rsg axis not configured, or effective rsg below its thresholds).
     *
     * Skips method calls (`m.foo()`) and namespaced calls (`alpha.foo()`) — only the bare
     * top-level builtin form resolves to a global callable.
     */
    private validateGlobalCallableAvailability;
    /**
     * Compute (but don't emit) the diagnostic for one axis of {@link Availability}: returns
     * `globalCallableRemoved` if the project's effective version is at/past the axis's
     * `removed` threshold, otherwise `globalCallableDeprecated` if it's at/past `deprecated`,
     * otherwise `undefined`.
     *
     * `effectiveVersion` is expected in canonical semver form (program getters guarantee this);
     * availability constants are authored in canonical form too, so no coercion is needed here.
     */
    private computeAvailabilityDiagnostic;
}
