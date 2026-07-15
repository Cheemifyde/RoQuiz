"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentFlagProcessor = void 0;
const DiagnosticMessages_1 = require("./DiagnosticMessages");
const util_1 = require("./util");
class CommentFlagProcessor {
    constructor(
    /**
     * The file this processor applies to
     */
    file, 
    /**
     * An array of strings containing the types of text that a comment starts with. (i.e. `REM`, `'`, `<!--`)
     */
    commentStarters = [], 
    /**
     * Valid diagnostic codes. Codes NOT in this list will be flagged
     */
    diagnosticCodes = []) {
        this.file = file;
        this.commentStarters = commentStarters;
        this.diagnosticCodes = diagnosticCodes;
        /**
         * List of comment flags generated during processing
         */
        this.commentFlags = [];
        /**
         * List of diagnostics generated during processing
         */
        this.diagnostics = [];
        /**
         * Block-level `bs:disable` / `bs:enable` directives, recorded in source order
         * by `tryAdd` and resolved into `CommentFlag`s by `finalize()`.
         */
        this.blockDirectives = [];
    }
    tryAdd(text, range) {
        const tokenized = this.tokenize(text, range);
        if (!tokenized) {
            return;
        }
        //queue block directives with their raw code tokens; finalize() validates and resolves them
        if (tokenized.directive === 'disable' || tokenized.directive === 'enable') {
            this.blockDirectives.push({
                kind: tokenized.directive,
                rawCodes: tokenized.codes,
                range: range
            });
            return;
        }
        //line-level directives emit a flag inline
        const affectedRange = tokenized.directive === 'line'
            ? util_1.util.createRange(range.start.line, 0, range.start.line, range.start.character)
            : util_1.util.createRange(range.start.line + 1, 0, range.start.line + 1, Number.MAX_SAFE_INTEGER);
        if (tokenized.codes.length === 0) {
            //bare `bs:disable-line` / `bs:disable-next-line` suppresses everything
            this.commentFlags.push({
                file: this.file,
                codes: null,
                range: range,
                affectedRange: affectedRange
            });
            return;
        }
        const codes = this.collectCodes(tokenized.codes);
        if (codes && codes.length > 0) {
            this.commentFlags.push({
                file: this.file,
                codes: codes,
                range: range,
                affectedRange: affectedRange
            });
        }
    }
    /**
     * Resolve any pending `bs:disable` / `bs:enable` block directives into `CommentFlag`s.
     * Must be called after the file's comment tokens have been fed through `tryAdd`.
     */
    finalize() {
        if (this.blockDirectives.length === 0) {
            return;
        }
        //state across the file: which codes are suppressed within the current block
        let allSuppressed = false;
        const carveOuts = new Set();
        for (let i = 0; i < this.blockDirectives.length; i++) {
            const directive = this.blockDirectives[i];
            const codes = this.collectCodes(directive.rawCodes);
            //apply this directive to the running state
            if (codes === null) {
                //bare `bs:disable` / `bs:enable` resets state
                allSuppressed = directive.kind === 'disable';
                carveOuts.clear();
            }
            else if (directive.kind === 'disable') {
                //in disable-all mode, "disable: X" cancels a prior carve-out for X
                //in enable-all mode, "disable: X" adds X to the suppressed set
                for (const code of codes) {
                    if (allSuppressed) {
                        carveOuts.delete(code);
                    }
                    else {
                        carveOuts.add(code);
                    }
                }
            }
            else {
                //'enable' with specific codes does the opposite of the disable branch above
                for (const code of codes) {
                    if (allSuppressed) {
                        carveOuts.add(code);
                    }
                    else {
                        carveOuts.delete(code);
                    }
                }
            }
            //affectedRange runs from the line after this directive to just before the next block directive (or EOF)
            const next = this.blockDirectives[i + 1];
            const startLine = directive.range.start.line + 1;
            const endLine = next ? next.range.start.line - 1 : Number.MAX_SAFE_INTEGER;
            if (endLine < startLine) {
                continue;
            }
            const affectedRange = util_1.util.createRange(startLine, 0, endLine, Number.MAX_SAFE_INTEGER);
            //emit a flag only when the current state actually suppresses something
            if (allSuppressed) {
                this.commentFlags.push({
                    file: this.file,
                    codes: null,
                    enableCodes: carveOuts.size > 0 ? [...carveOuts] : undefined,
                    range: directive.range,
                    affectedRange: affectedRange
                });
            }
            else if (carveOuts.size > 0) {
                this.commentFlags.push({
                    file: this.file,
                    codes: [...carveOuts],
                    range: directive.range,
                    affectedRange: affectedRange
                });
            }
        }
    }
    /**
     * Resolve a list of `{ code, range }` tokens into validated diagnostic codes.
     * Pushes diagnostics for any unknown numeric codes. Returns `null` when no codes were specified
     * (i.e. a bare `bs:disable` / `bs:enable`), and an array otherwise.
     */
    collectCodes(rawCodes) {
        var _a, _b;
        if (rawCodes.length === 0) {
            return null;
        }
        const codes = [];
        for (const codeToken of rawCodes) {
            const codeInt = parseInt(codeToken.code);
            if (isNaN(codeInt)) {
                //plugin-contributed or non-numeric code
                codes.push((_b = (_a = codeToken.code) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.toLowerCase());
            }
            else if (this.diagnosticCodes.includes(codeInt)) {
                codes.push(codeInt);
            }
            else {
                this.diagnostics.push(Object.assign(Object.assign({}, DiagnosticMessages_1.DiagnosticMessages.unknownDiagnosticCode(codeInt)), { file: this.file, range: codeToken.range }));
            }
        }
        return codes;
    }
    /**
     * Small tokenizer for `bs:` directive comments.
     */
    tokenize(text, range) {
        let lowerText = text.toLowerCase();
        let offset = 0;
        let commentTokenText = null;
        for (const starter of this.commentStarters) {
            if (text.startsWith(starter)) {
                commentTokenText = starter;
                offset = starter.length;
                lowerText = lowerText.substring(commentTokenText.length);
                break;
            }
        }
        //trim leading whitespace
        const len = lowerText.length;
        lowerText = lowerText.trimLeft();
        offset += len - lowerText.length;
        //match longest-prefix first so `bs:disable-line` doesn't get parsed as `bs:disable`
        let directive;
        if (lowerText.startsWith('bs:disable-line')) {
            lowerText = lowerText.substring('bs:disable-line'.length);
            offset += 'bs:disable-line'.length;
            directive = 'line';
        }
        else if (lowerText.startsWith('bs:disable-next-line')) {
            lowerText = lowerText.substring('bs:disable-next-line'.length);
            offset += 'bs:disable-next-line'.length;
            directive = 'next-line';
        }
        else if (lowerText.startsWith('bs:disable')) {
            lowerText = lowerText.substring('bs:disable'.length);
            offset += 'bs:disable'.length;
            directive = 'disable';
        }
        else if (lowerText.startsWith('bs:enable')) {
            lowerText = lowerText.substring('bs:enable'.length);
            offset += 'bs:enable'.length;
            directive = 'enable';
        }
        else {
            return null;
        }
        //discard the colon
        if (lowerText.startsWith(':')) {
            lowerText = lowerText.substring(1);
            offset += 1;
        }
        const items = this.tokenizeByWhitespace(lowerText);
        const codes = [];
        for (const item of items) {
            codes.push({
                code: item.text,
                range: util_1.util.createRange(range.start.line, range.start.character + offset + item.startIndex, range.start.line, range.start.character + offset + item.startIndex + item.text.length)
            });
        }
        return {
            commentTokenText: commentTokenText,
            directive: directive,
            codes: codes
        };
    }
    /**
     * Given a string, extract each item split by whitespace
     * @param text the text to tokenize
     */
    tokenizeByWhitespace(text) {
        let tokens = [];
        let currentToken = null;
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            //if we hit whitespace
            if (char === ' ' || char === '\t') {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = null;
                }
                //we hit non-whitespace
            }
            else {
                if (!currentToken) {
                    currentToken = {
                        startIndex: i,
                        text: ''
                    };
                }
                currentToken.text += char;
            }
        }
        if (currentToken) {
            tokens.push(currentToken);
        }
        return tokens;
    }
}
exports.CommentFlagProcessor = CommentFlagProcessor;
//# sourceMappingURL=CommentFlagProcessor.js.map