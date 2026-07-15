"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomDiagnosticReporter = exports.printDiagnosticGithubActions = exports.applyDiagnosticTemplate = exports.getDiagnosticSquigglyText = exports.getDiagnosticLine = exports.printDiagnostic = exports.normalizeDiagnosticReporters = exports.getPrintDiagnosticOptions = exports.KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS = void 0;
const chalk_1 = require("chalk");
const vscode_languageserver_1 = require("vscode-languageserver");
const KNOWN_DIAGNOSTIC_REPORTER_PRESETS = ['detailed', 'github-actions'];
/**
 * The set of placeholder names recognized inside a custom diagnostic reporter template.
 * `buildDiagnosticPlaceholders` is typed against this list, so adding a name here will
 * cause a compile error until the corresponding value is supplied (and vice versa).
 */
exports.KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS = [
    'file',
    'line',
    'col',
    'endLine',
    'endCol',
    'severity',
    'severityCode',
    'code',
    'message',
    'source'
];
//Built directly from the known-names list so that adding a placeholder is a one-line change.
//Names are simple identifiers (camelCase) so no regex-escaping is needed.
const KNOWN_PLACEHOLDER_REGEX = new RegExp(`\\{(${exports.KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS.join('|')})\\}`, 'g');
function findKnownPlaceholders(template) {
    var _a;
    return (_a = template.match(KNOWN_PLACEHOLDER_REGEX)) !== null && _a !== void 0 ? _a : [];
}
function describeDiagnosticReporterOptions() {
    const presets = KNOWN_DIAGNOSTIC_REPORTER_PRESETS.map(x => `"${x}"`).join(', ');
    const placeholders = exports.KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS.map(x => `{${x}}`).join(', ');
    return `Expected one of:\n  - preset name: ${presets}\n  - template containing at least one placeholder: ${placeholders}`;
}
/**
 * Prepare print diagnostic formatting options
 */
function getPrintDiagnosticOptions(options) {
    var _a;
    let cwd = (options === null || options === void 0 ? void 0 : options.cwd) ? options.cwd : process.cwd();
    let emitFullPaths = (options === null || options === void 0 ? void 0 : options.emitFullPaths) === true;
    let diagnosticLevel = (_a = options === null || options === void 0 ? void 0 : options.diagnosticLevel) !== null && _a !== void 0 ? _a : 'warn';
    let diagnosticSeverityMap = {};
    diagnosticSeverityMap.info = vscode_languageserver_1.DiagnosticSeverity.Information;
    diagnosticSeverityMap.hint = vscode_languageserver_1.DiagnosticSeverity.Hint;
    diagnosticSeverityMap.warn = vscode_languageserver_1.DiagnosticSeverity.Warning;
    diagnosticSeverityMap.error = vscode_languageserver_1.DiagnosticSeverity.Error;
    let severityLevel = diagnosticSeverityMap[diagnosticLevel] || vscode_languageserver_1.DiagnosticSeverity.Warning;
    let order = [vscode_languageserver_1.DiagnosticSeverity.Information, vscode_languageserver_1.DiagnosticSeverity.Hint, vscode_languageserver_1.DiagnosticSeverity.Warning, vscode_languageserver_1.DiagnosticSeverity.Error];
    let includeDiagnostic = order.slice(order.indexOf(severityLevel)).reduce((acc, value) => {
        acc[value] = true;
        return acc;
    }, {});
    let typeColor = {};
    typeColor[vscode_languageserver_1.DiagnosticSeverity.Information] = chalk_1.default.blue;
    typeColor[vscode_languageserver_1.DiagnosticSeverity.Hint] = chalk_1.default.green;
    typeColor[vscode_languageserver_1.DiagnosticSeverity.Warning] = chalk_1.default.yellow;
    typeColor[vscode_languageserver_1.DiagnosticSeverity.Error] = chalk_1.default.red;
    let severityTextMap = {};
    severityTextMap[vscode_languageserver_1.DiagnosticSeverity.Information] = 'info';
    severityTextMap[vscode_languageserver_1.DiagnosticSeverity.Hint] = 'hint';
    severityTextMap[vscode_languageserver_1.DiagnosticSeverity.Warning] = 'warning';
    severityTextMap[vscode_languageserver_1.DiagnosticSeverity.Error] = 'error';
    return {
        cwd: cwd,
        emitFullPaths: emitFullPaths,
        severityLevel: severityLevel,
        includeDiagnostic: includeDiagnostic,
        typeColor: typeColor,
        severityTextMap: severityTextMap
    };
}
exports.getPrintDiagnosticOptions = getPrintDiagnosticOptions;
/**
 * Resolve a single `DiagnosticReporter` value into its object form.
 * String shorthand rules:
 *   - if the value contains at least one known `{placeholder}`, it's a custom template
 *   - otherwise it must match one of the known preset names
 * Throws with the full list of supported presets and placeholders when nothing matches,
 * so typos in either bucket surface loudly.
 */
function normalizeOneDiagnosticReporter(value) {
    if (typeof value === 'string') {
        if (KNOWN_DIAGNOSTIC_REPORTER_PRESETS.includes(value)) {
            return { type: value };
        }
        if (findKnownPlaceholders(value).length > 0) {
            return { type: 'custom', format: value };
        }
        throw new Error(`Unknown diagnostic reporter "${value}". ${describeDiagnosticReporterOptions()}`);
    }
    if (value.type === 'custom') {
        if (typeof value.format !== 'string' || value.format.length === 0) {
            throw new Error(`Diagnostic reporter type "custom" requires a non-empty "format" string.`);
        }
        if (findKnownPlaceholders(value.format).length === 0) {
            throw new Error(`Diagnostic reporter template "${value.format}" does not contain any known placeholders. Supported placeholders: ${exports.KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS.map(x => `{${x}}`).join(', ')}`);
        }
        return { type: 'custom', format: value.format };
    }
    if (value.type === 'detailed' || value.type === 'github-actions') {
        return { type: value.type };
    }
    throw new Error(`Unknown diagnostic reporter type "${value.type}".`);
}
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
function normalizeDiagnosticReporters(value, logger) {
    var _a;
    if (value === undefined || value === null) {
        return [{ type: 'detailed' }];
    }
    const inputs = Array.isArray(value) ? value : [value];
    if (inputs.length === 0) {
        return [];
    }
    const warn = (message) => (logger ? logger.warn(message) : console.warn(message));
    //presets are deduped by `type`; custom templates are deduped by their format string. running the
    //same reporter twice would only produce duplicate output, so it's almost always a config mistake.
    const seen = new Set();
    const result = [];
    for (const input of inputs) {
        let reporter;
        try {
            reporter = normalizeOneDiagnosticReporter(input);
        }
        catch (e) {
            warn(`Ignoring invalid diagnostic reporter: ${(_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : String(e)}`);
            continue;
        }
        const key = reporter.type === 'custom' ? `custom:${reporter.format}` : reporter.type;
        if (seen.has(key)) {
            const description = reporter.type === 'custom' ? `custom template "${reporter.format}"` : `"${reporter.type}"`;
            warn(`Ignoring duplicate diagnostic reporter: ${description}`);
            continue;
        }
        seen.add(key);
        result.push(reporter);
    }
    if (result.length === 0) {
        warn(`No valid diagnostic reporters configured; falling back to "detailed".`);
        return [{ type: 'detailed' }];
    }
    return result;
}
exports.normalizeDiagnosticReporters = normalizeDiagnosticReporters;
/**
 * Format output of one diagnostic
 */
function printDiagnostic(options, severity, filePath, lines, diagnostic, relatedInformation) {
    var _a, _b, _c, _d, _e;
    let { includeDiagnostic, severityTextMap, typeColor } = options;
    if (!includeDiagnostic[severity]) {
        return;
    }
    let severityText = severityTextMap[severity];
    console.log('');
    console.log(chalk_1.default.cyan(filePath !== null && filePath !== void 0 ? filePath : '<unknown file>') +
        ':' +
        chalk_1.default.yellow(diagnostic.range
            ? (diagnostic.range.start.line + 1) + ':' + (diagnostic.range.start.character + 1)
            : 'line?:col?') +
        ' - ' +
        typeColor[severity](severityText) +
        ' ' +
        chalk_1.default.grey('BS' + diagnostic.code) +
        ': ' +
        chalk_1.default.white(diagnostic.message));
    console.log('');
    //Get the line referenced by the diagnostic. if we couldn't find a line,
    // default to an empty string so it doesn't crash the error printing below
    let diagnosticLine = (_d = lines[(_c = (_b = (_a = diagnostic.range) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.line) !== null && _c !== void 0 ? _c : -1]) !== null && _d !== void 0 ? _d : '';
    console.log(getDiagnosticLine(diagnostic, diagnosticLine, typeColor[severity]));
    //print related information if present (only first few rows)
    const relatedInfoList = relatedInformation !== null && relatedInformation !== void 0 ? relatedInformation : [];
    let indent = '    ';
    for (let i = 0; i < relatedInfoList.length; i++) {
        let relatedInfo = relatedInfoList[i];
        //only show the first 5 relatedInfo links
        if (i < 5) {
            console.log('');
            console.log(indent, chalk_1.default.cyan((_e = relatedInfo.filePath) !== null && _e !== void 0 ? _e : '<unknown file>') +
                ':' +
                chalk_1.default.yellow(relatedInfo.range
                    ? (relatedInfo.range.start.line + 1) + ':' + (relatedInfo.range.start.character + 1)
                    : 'line?:col?'));
            console.log(indent, relatedInfo.message);
        }
        else {
            console.log('\n', indent, `...and ${relatedInfoList.length - i + 1} more`);
            break;
        }
    }
    console.log('');
}
exports.printDiagnostic = printDiagnostic;
function getDiagnosticLine(diagnostic, diagnosticLine, colorFunction) {
    let result = '';
    //only print the line information if we have some
    if (diagnostic.range && diagnosticLine) {
        const lineNumberText = chalk_1.default.bgWhite(' ' + chalk_1.default.black((diagnostic.range.start.line + 1).toString()) + ' ') + ' ';
        const blankLineNumberText = chalk_1.default.bgWhite(' ' + chalk_1.default.white(' '.repeat((diagnostic.range.start.line + 1).toString().length)) + ' ') + ' ';
        //remove tabs in favor of spaces to make diagnostic printing more consistent
        let leadingText = diagnosticLine.slice(0, diagnostic.range.start.character);
        let leadingTextNormalized = leadingText.replace(/\t/g, '    ');
        let actualText = diagnosticLine.slice(diagnostic.range.start.character, diagnostic.range.end.character);
        let actualTextNormalized = actualText.replace(/\t/g, '    ');
        let startIndex = leadingTextNormalized.length;
        let endIndex = leadingTextNormalized.length + actualTextNormalized.length;
        let diagnosticLineNormalized = diagnosticLine.replace(/\t/g, '    ');
        const squigglyText = getDiagnosticSquigglyText(diagnosticLineNormalized, startIndex, endIndex);
        result +=
            lineNumberText + diagnosticLineNormalized + '\n' +
                blankLineNumberText + colorFunction(squigglyText);
    }
    return result;
}
exports.getDiagnosticLine = getDiagnosticLine;
/**
 * Given a diagnostic, compute the range for the squiggly
 */
function getDiagnosticSquigglyText(line, startCharacter, endCharacter) {
    var _a;
    let squiggle;
    //fill the entire line
    if (
    //there is no range
    typeof startCharacter !== 'number' || typeof endCharacter !== 'number' ||
        //there is no line
        !line ||
        //both positions point to same location
        startCharacter === endCharacter ||
        //the diagnostic starts after the end of the line
        startCharacter >= line.length) {
        squiggle = ''.padStart((_a = line === null || line === void 0 ? void 0 : line.length) !== null && _a !== void 0 ? _a : 0, '~');
    }
    else {
        let endIndex = Math.max(endCharacter, line.length);
        endIndex = endIndex > 0 ? endIndex : 0;
        if ((line === null || line === void 0 ? void 0 : line.length) < endIndex) {
            endIndex = line.length;
        }
        let leadingWhitespaceLength = startCharacter;
        let squiggleLength;
        if (endCharacter === Number.MAX_VALUE) {
            squiggleLength = line.length - leadingWhitespaceLength;
        }
        else {
            squiggleLength = endCharacter - startCharacter;
        }
        let trailingWhitespaceLength = endIndex - endCharacter;
        //opening whitespace
        squiggle =
            ''.padStart(leadingWhitespaceLength, ' ') +
                //squiggle
                ''.padStart(squiggleLength, '~') +
                //trailing whitespace
                ''.padStart(trailingWhitespaceLength, ' ');
        //trim the end of the squiggle so it doesn't go longer than the end of the line
        if (squiggle.length > endIndex) {
            squiggle = squiggle.slice(0, endIndex);
        }
    }
    return squiggle;
}
exports.getDiagnosticSquigglyText = getDiagnosticSquigglyText;
/**
 * Build the placeholder values used by the custom-template reporter.
 * The return type is keyed off `KNOWN_DIAGNOSTIC_TEMPLATE_PLACEHOLDERS`, so
 * the compiler enforces that the two stay in sync.
 * Positions are 1-based to match editor/CI conventions; missing ranges fall back to 1.
 */
function buildDiagnosticPlaceholders(severity, severityText, filePath, diagnostic) {
    var _a, _b;
    const range = diagnostic.range;
    const line = range ? range.start.line + 1 : 1;
    const col = range ? range.start.character + 1 : 1;
    const endLine = range ? range.end.line + 1 : line;
    const endCol = range ? range.end.character + 1 : col;
    return {
        file: filePath !== null && filePath !== void 0 ? filePath : '',
        line: String(line),
        col: String(col),
        endLine: String(endLine),
        endCol: String(endCol),
        severity: severityText,
        severityCode: String(severity),
        code: diagnostic.code === undefined ? '' : String(diagnostic.code),
        message: (_a = diagnostic.message) !== null && _a !== void 0 ? _a : '',
        source: (_b = diagnostic.source) !== null && _b !== void 0 ? _b : ''
    };
}
/**
 * Substitute `{name}` placeholders in `template` using the given values.
 * Only known placeholder names are matched; anything else (typos like `{filename}`
 * or unrelated braces in user text) passes through unchanged.
 */
function applyDiagnosticTemplate(template, values) {
    return template.replace(KNOWN_PLACEHOLDER_REGEX, (_match, name) => values[name]);
}
exports.applyDiagnosticTemplate = applyDiagnosticTemplate;
/**
 * Escape a value for use inside a GitHub Actions workflow command.
 * The message portion (after `::`) needs `%`, `\r`, and `\n` escaped;
 * parameter values additionally need `,` and `:` escaped.
 * @see https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions
 */
function escapeGithubActionsData(value) {
    return value
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeGithubActionsProperty(value) {
    return escapeGithubActionsData(value)
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
const GITHUB_ACTIONS_SEVERITY_COMMAND = {
    [vscode_languageserver_1.DiagnosticSeverity.Error]: 'error',
    [vscode_languageserver_1.DiagnosticSeverity.Warning]: 'warning',
    [vscode_languageserver_1.DiagnosticSeverity.Information]: 'notice',
    [vscode_languageserver_1.DiagnosticSeverity.Hint]: 'notice'
};
/**
 * Print one diagnostic in GitHub Actions workflow command format so the
 * runner surfaces it as a PR annotation.
 */
function printDiagnosticGithubActions(ctx) {
    var _a, _b;
    const { options, severity, filePath, diagnostic } = ctx;
    if (!options.includeDiagnostic[severity]) {
        return;
    }
    const command = (_a = GITHUB_ACTIONS_SEVERITY_COMMAND[severity]) !== null && _a !== void 0 ? _a : 'error';
    const range = diagnostic.range;
    const line = range ? range.start.line + 1 : 1;
    const col = range ? range.start.character + 1 : 1;
    const endLine = range ? range.end.line + 1 : line;
    const endCol = range ? range.end.character + 1 : col;
    const codeText = diagnostic.code === undefined ? '' : `BS${diagnostic.code}`;
    const params = [];
    if (filePath) {
        params.push(`file=${escapeGithubActionsProperty(filePath)}`);
    }
    params.push(`line=${line}`);
    params.push(`col=${col}`);
    params.push(`endLine=${endLine}`);
    params.push(`endColumn=${endCol}`);
    if (codeText) {
        params.push(`title=${escapeGithubActionsProperty(codeText)}`);
    }
    const message = escapeGithubActionsData((_b = diagnostic.message) !== null && _b !== void 0 ? _b : '');
    console.log(`::${command} ${params.join(',')}::${message}`);
}
exports.printDiagnosticGithubActions = printDiagnosticGithubActions;
/**
 * Build a reporter that renders each diagnostic via the given user-supplied template.
 * See `BsConfig.diagnosticReporters` for the placeholder list.
 */
function createCustomDiagnosticReporter(template) {
    return (ctx) => {
        var _a;
        const { options, severity, filePath, diagnostic } = ctx;
        if (!options.includeDiagnostic[severity]) {
            return;
        }
        const severityText = (_a = options.severityTextMap[severity]) !== null && _a !== void 0 ? _a : '';
        const placeholders = buildDiagnosticPlaceholders(severity, severityText, filePath, diagnostic);
        console.log(applyDiagnosticTemplate(template, placeholders));
    };
}
exports.createCustomDiagnosticReporter = createCustomDiagnosticReporter;
//# sourceMappingURL=diagnosticUtils.js.map