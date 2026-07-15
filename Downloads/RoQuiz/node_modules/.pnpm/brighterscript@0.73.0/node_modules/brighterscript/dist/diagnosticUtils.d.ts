import type { Chalk } from 'chalk';
import type { BsConfig, DiagnosticReporter, NormalizedDiagnosticReporter } from './BsConfig';
import { DiagnosticSeverity } from 'vscode-languageserver';
import type { BsDiagnostic } from '.';
import type { Range } from 'vscode-languageserver';
/**
 * The set of placeholder names recognized inside a custom diagnostic reporter template.
 * `buildDiagnosticPlaceholders` is typed against this list, so adding a name here will
 * cause a compile error until the corresponding value is supplied (and vice versa).
 */
export declare const KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS: readonly ["file", "line", "col", "endLine", "endCol", "severity", "severityCode", "code", "message", "source"];
/**
 * Prepare print diagnostic formatting options
 */
export declare function getPrintDiagnosticOptions(options: BsConfig): {
    cwd: string;
    emitFullPaths: boolean;
    severityLevel: DiagnosticSeverity;
    includeDiagnostic: {};
    typeColor: Record<string, Chalk>;
    severityTextMap: {};
};
/**
 * Resolve a `DiagnosticReporter` value (or array of them) into the array of object-form
 * reporters used by the printer.
 *
 * Behavior:
 *   - missing/null value → default `[{ type: 'detailed' }]`
 *   - explicit empty array → preserved (caller has opted out of all output)
 *   - invalid entry inside a non-empty input → warned via `logger`, skipped
 *   - duplicate entry (same preset type, or same custom-template format string) → warned, skipped
 *   - all entries invalid → warned, falls back to `[{ type: 'detailed' }]`
 *
 * Bad reporters never throw, surfacing a typo shouldn't be able to abort a build.
 */
export declare function normalizeDiagnosticReporters(value: DiagnosticReporter | DiagnosticReporter[] | undefined, logger?: {
    warn(...messages: any[]): void;
}): NormalizedDiagnosticReporter[];
/**
 * Format output of one diagnostic
 */
export declare function printDiagnostic(options: ReturnType<typeof getPrintDiagnosticOptions>, severity: DiagnosticSeverity, filePath: string | undefined, lines: string[], diagnostic: BsDiagnostic, relatedInformation?: Array<{
    range: Range;
    filePath: string;
    message: string;
}>): void;
export declare function getDiagnosticLine(diagnostic: BsDiagnostic, diagnosticLine: string, colorFunction: Chalk): string;
/**
 * Given a diagnostic, compute the range for the squiggly
 */
export declare function getDiagnosticSquigglyText(line: string | undefined, startCharacter: number | undefined, endCharacter: number | undefined): string;
/**
 * Substitute `{name}` placeholders in `template` using the given values.
 * Only known placeholder names are matched; anything else (typos like `{filename}`
 * or unrelated braces in user text) passes through unchanged.
 */
export declare function applyDiagnosticTemplate(template: string, values: Record<string, string>): string;
/**
 * Print one diagnostic in GitHub Actions workflow command format so the
 * runner surfaces it as a PR annotation.
 */
export declare function printDiagnosticGithubActions(ctx: DiagnosticPrintContext): void;
/**
 * Build a reporter that renders each diagnostic via the given user-supplied template.
 * See `BsConfig.diagnosticReporters` for the placeholder list.
 */
export declare function createCustomDiagnosticReporter(template: string): DiagnosticReporterFn;
/**
 * Context passed to the object-shaped diagnostic reporters
 * (`printDiagnosticGithubActions`, custom-template reporters).
 * The detailed reporter has its own positional signature for backward compatibility.
 */
export interface DiagnosticPrintContext {
    options: ReturnType<typeof getPrintDiagnosticOptions>;
    severity: DiagnosticSeverity;
    filePath: string | undefined;
    diagnostic: BsDiagnostic;
}
export declare type DiagnosticReporterFn = (ctx: DiagnosticPrintContext) => void;
