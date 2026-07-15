import type { Program } from '../../Program';
export declare class ProgramValidator {
    private program;
    constructor(program: Program);
    process(): void;
    /**
     * Flag any files that are included in 0 scopes.
     */
    private flagScopelessBrsFiles;
    /**
     * Validate the manifest's `rsg_version` entry. Lifecycle data is sourced from the
     * `RSG_VERSIONS` map in `src/RokuConstants.ts`; this validator simply derives diagnostics
     * from those fields:
     * - format must be parseable as semver
     * - cross-check `introducedAt` against effective `minFirmwareVersion`
     * - flag versions with a `deprecatedAt` availability field (e.g. 1.0)
     * Versions not in the map are treated as "unknown but valid" — no diagnostic.
     */
    private validateManifest;
}
