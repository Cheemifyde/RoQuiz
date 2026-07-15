"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIONAL_CHAINING_MIN_FIRMWARE_VERSION = exports.DEFAULT_MIN_FIRMWARE_VERSION = exports.RSG_VERSIONS = void 0;
/**
 * Single source of truth for known `rsg_version` values. Adding a new RSG version means adding
 * one entry here; downstream validators and `Program.getRsgVersion()` will pick it up.
 *
 * Versions not present in this map are treated as "unknown but valid" (assuming they parse as
 * semver). brighterscript can't validate firmware compatibility for versions it hasn't been
 * updated to recognize.
 */
exports.RSG_VERSIONS = {
    '1.0': {
        introducedAt: '0.0.0',
        becameDefaultAt: '0.0.0',
        deprecatedAt: '8.0.0',
        removedAt: '9.0.0',
        replacement: '1.2'
    },
    '1.1': {
        introducedAt: '7.5.0',
        becameDefaultAt: '7.5.0',
        removedAt: '14.5.0',
        replacement: '1.2'
    },
    '1.2': {
        introducedAt: '9.0.0',
        becameDefaultAt: '9.3.0',
        //Roku announced 1.2 as "being deprecated" alongside the OS 15.0 launch (Oct 2025), with a
        //2026-10-01 certification deadline. We gate the warning on 15.1.0 (the firmware where 1.3
        //became the required minimum for new app submissions) — a project targeting that firmware
        //or newer can actually adopt 1.3, so the warning is actionable.
        deprecatedAt: '15.1.0',
        replacement: '1.3'
    },
    '1.3': {
        introducedAt: '15.0.0',
        becameDefaultAt: '15.1.0' // Roku's static analysis cert tool requires rsg_version=1.3
        //when the manifest's minFirmwareVersion is 15.1.0+ (warning today, blocks publishing
        //starting Oct 1, 2026). This is the firmware where 1.3 effectively becomes the
        //expected default for new development. TODO: confirm exact semantics with Roku.
    }
};
/**
 * Default minimum Roku firmware version assumed when the user hasn't configured
 * `minFirmwareVersion`. Chosen to reflect a modern Roku target so that diagnostics relevant to
 * current firmware fire by default. Users targeting older firmware should set
 * `minFirmwareVersion` explicitly.
 */
exports.DEFAULT_MIN_FIRMWARE_VERSION = '15.0.0';
/**
 * Minimum Roku firmware version that introduced optional chaining (`?.`, `?[`, `?(`).
 * Optional chaining is NOT transpiled by BrighterScript, so this restriction applies to both
 * .brs and .bs files — the target device must natively support it.
 * Source: Roku OS 11 release notes.
 */
exports.OPTIONAL_CHAINING_MIN_FIRMWARE_VERSION = '11.0.0';
//# sourceMappingURL=RokuConstants.js.map