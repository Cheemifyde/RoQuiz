import type { ProvideInlayHintsEvent } from '../../interfaces';
export declare class InlayHintProcessor {
    event: ProvideInlayHintsEvent;
    constructor(event: ProvideInlayHintsEvent);
    process(): void;
    private collectParameterNameHints;
    private emitParameterNameHints;
    private emitParameterNameHintsForCallfunc;
    /**
     * For a CallExpression, find the function/method being called and return its parameter list,
     * or undefined if the target cannot be uniquely resolved.
     */
    private resolveCallParameters;
    private lookupFunctionParameters;
    /**
     * For a method call like `m.foo(...)`, find a uniquely-resolvable method statement.
     * If the receiver is `m`, prefer the enclosing class. Otherwise fall back to a name search
     * across all classes (only used when there's exactly one match).
     */
    private lookupClassMethodParameters;
    private resolveCallfuncParameters;
    private pushHintsForArgs;
}
