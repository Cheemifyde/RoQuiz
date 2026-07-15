/**
 * Availability markers for a feature on a single version axis (firmware OS, or rsg_version).
 * All fields are version strings — coerced to semver at the point of comparison.
 *
 * Combine with the {@link Availability} container when a feature has availability info on both
 * axes (e.g. a callable that was added at firmware X.Y AND removed at rsg_version Z.W).
 */
export interface AvailabilityInfo {
    /** First version on this axis at which the feature exists. */
    added?: string;
    /** First version on this axis at which use of the feature is discouraged. */
    deprecated?: string;
    /** First version on this axis at which the feature stops working as declared. */
    removed?: string;
}
/**
 * Per-axis availability info for a feature. Either side may be absent. A diagnostic fires for
 * each axis whose threshold is met by the user's effective values.
 */
export interface Availability {
    /** Availability relative to Roku OS firmware versions. */
    os?: AvailabilityInfo;
    /** Availability relative to manifest `rsg_version` values. */
    rsg?: AvailabilityInfo;
}
/**
 * Lifecycle metadata for a single `rsg_version` value.
 *
 * Sources: Roku's developer release notes and channel-manifest documentation. When adding a new
 * rsg_version, record the firmware versions at each lifecycle transition rather than scattering
 * version numbers across the codebase.
 */
export interface RsgVersionInfo {
    /**
     * Minimum Roku firmware version that can compile/run this rsg_version. If `effectiveFw <
     * introducedAt` and the manifest declares this version, the project is misconfigured.
     */
    introducedAt: string;
    /**
     * Firmware version where this rsg_version becomes the expected default for new development
     * at that firmware target. For older versions (1.0/1.1/1.2) this corresponds to Roku's
     * device-side silent fallback (what runs when the manifest is silent). For 1.3 it
     * corresponds to Roku's static-analysis cert requirement (the firmware at which the cert
     * tool flags channels for not declaring 1.3). `getRsgVersion()` walks this field
     * (highest matching wins) to figure out what version a project should target.
     */
    becameDefaultAt?: string;
    /**
     * Firmware version that deprecated this rsg_version. Channels using a deprecated version
     * still function with the semantics they declared but are flagged for upgrade.
     */
    deprecatedAt?: string;
    /**
     * Firmware version where this rsg_version stopped being honored as declared. From this
     * firmware on, the device either refuses to run the channel or silently substitutes a
     * different rsg_version (`replacement`). Either way, the manifest entry no longer means
     * what the developer wrote, so this is treated as an error-severity diagnostic.
     */
    removedAt?: string;
    /**
     * Suggested replacement value. Used both for the deprecation suggestion and (when set
     * together with `removedAt`) to describe what the device silently runs instead.
     */
    replacement?: string;
}
/**
 * Single source of truth for known `rsg_version` values. Adding a new RSG version means adding
 * one entry here; downstream validators and `Program.getRsgVersion()` will pick it up.
 *
 * Versions not present in this map are treated as "unknown but valid" (assuming they parse as
 * semver). brighterscript can't validate firmware compatibility for versions it hasn't been
 * updated to recognize.
 */
export declare const RSG_VERSIONS: Record<string, RsgVersionInfo>;
/**
 * Default minimum Roku firmware version assumed when the user hasn't configured
 * `minFirmwareVersion`. Chosen to reflect a modern Roku target so that diagnostics relevant to
 * current firmware fire by default. Users targeting older firmware should set
 * `minFirmwareVersion` explicitly.
 */
export declare const DEFAULT_MIN_FIRMWARE_VERSION = "15.0.0";
/**
 * Minimum Roku firmware version that introduced optional chaining (`?.`, `?[`, `?(`).
 * Optional chaining is NOT transpiled by BrighterScript, so this restriction applies to both
 * .brs and .bs files — the target device must natively support it.
 * Source: Roku OS 11 release notes.
 */
export declare const OPTIONAL_CHAINING_MIN_FIRMWARE_VERSION = "11.0.0";
