"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramValidator = void 0;
const reflection_1 = require("../../astUtils/reflection");
const DiagnosticMessages_1 = require("../../DiagnosticMessages");
const RokuConstants_1 = require("../../RokuConstants");
const util_1 = require("../../util");
const semver = require("semver");
class ProgramValidator {
    constructor(program) {
        this.program = program;
    }
    process() {
        this.flagScopelessBrsFiles();
        this.validateManifest();
    }
    /**
     * Flag any files that are included in 0 scopes.
     */
    flagScopelessBrsFiles() {
        for (const key in this.program.files) {
            const file = this.program.files[key];
            if (
            //if this isn't a brs file, skip
            !(0, reflection_1.isBrsFile)(file) ||
                //if the file is included in at least one scope, skip
                this.program.getFirstScopeForFile(file)) {
                continue;
            }
            this.program.addDiagnostics([Object.assign(Object.assign({}, DiagnosticMessages_1.DiagnosticMessages.fileNotReferencedByAnyOtherFile()), { file: file, range: util_1.default.createRange(0, 0, 0, Number.MAX_VALUE) })]);
        }
    }
    /**
     * Validate the manifest's `rsg_version` entry. Lifecycle data is sourced from the
     * `RSG_VERSIONS` map in `src/RokuConstants.ts`; this validator simply derives diagnostics
     * from those fields:
     * - format must be parseable as semver
     * - cross-check `introducedAt` against effective `minFirmwareVersion`
     * - flag versions with a `deprecatedAt` availability field (e.g. 1.0)
     * Versions not in the map are treated as "unknown but valid" — no diagnostic.
     */
    validateManifest() {
        //getManifestEntries and getManifestPath are intentionally protected for now (no stable
        //public API yet) — use bracket access here to bypass the visibility check.
        /* eslint-disable @typescript-eslint/dot-notation */
        const entries = this.program['getManifestEntries']();
        const manifestPath = this.program['getManifestPath']();
        /* eslint-enable @typescript-eslint/dot-notation */
        if (!entries || entries.length === 0 || !manifestPath) {
            return;
        }
        const rsgEntry = entries.find(e => e.key.trim() === 'rsg_version');
        if (!rsgEntry) {
            return;
        }
        const value = rsgEntry.value.trim();
        if (!semver.coerce(value)) {
            this.program.addDiagnostics([Object.assign(Object.assign({}, DiagnosticMessages_1.DiagnosticMessages.invalidRsgVersionFormat(value)), { file: { srcPath: manifestPath, pkgPath: 'manifest' }, range: rsgEntry.range })]);
            return;
        }
        const info = RokuConstants_1.RSG_VERSIONS[value];
        if (!info) {
            //version is parseable as semver but not in our known map — trust the user;
            //we don't have firmware-compat data for it.
            return;
        }
        //getMinFirmwareVersion returns canonical coerced semver; constants in RSG_VERSIONS are
        //hand-written valid semver. No re-coercion needed at this site.
        const effectiveFw = this.program.getMinFirmwareVersion();
        //removal takes precedence over deprecation. If `removedAt <= effectiveFw`, fire the
        //removal error and skip the deprecation warning — the manifest entry is no longer honored.
        if (info.removedAt && semver.gte(effectiveFw, info.removedAt) && info.replacement) {
            this.program.addDiagnostics([Object.assign(Object.assign({}, DiagnosticMessages_1.DiagnosticMessages.rsgVersionRemoved(value, info.removedAt, info.replacement)), { file: { srcPath: manifestPath, pkgPath: 'manifest' }, range: rsgEntry.range })]);
        }
        else if (info.deprecatedAt && info.replacement && semver.gte(effectiveFw, info.deprecatedAt)) {
            //fire deprecation only when the effective firmware is >= the deprecation point — projects
            //targeting pre-deprecation firmware can legitimately keep using the old version.
            this.program.addDiagnostics([Object.assign(Object.assign({}, DiagnosticMessages_1.DiagnosticMessages.rsgVersionDeprecated(value, info.replacement)), { file: { srcPath: manifestPath, pkgPath: 'manifest' }, range: rsgEntry.range })]);
        }
        if (semver.lt(effectiveFw, info.introducedAt)) {
            this.program.addDiagnostics([Object.assign(Object.assign({}, DiagnosticMessages_1.DiagnosticMessages.rsgVersionRequiresMinFirmware(value, info.introducedAt, effectiveFw)), { file: { srcPath: manifestPath, pkgPath: 'manifest' }, range: rsgEntry.range })]);
        }
    }
}
exports.ProgramValidator = ProgramValidator;
//# sourceMappingURL=ProgramValidator.js.map