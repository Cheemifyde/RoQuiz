import type { OnGetSourceFixAllCodeActionsEvent } from '../../interfaces';
export declare class FixAllCodeActionsProcessor {
    event: OnGetSourceFixAllCodeActionsEvent;
    constructor(event: OnGetSourceFixAllCodeActionsEvent);
    process(): void;
    /**
     * For every `voidFunctionMayNotReturnValue` diagnostic in this file,
     * remove the return value expression, leaving the bare `return` keyword.
     */
    private processVoidFunctionReturnActions;
    /**
     * For every `xmlComponentMissingExtendsAttribute` diagnostic in this file,
     * insert `extends="Group"` — the same choice marked `isPreferred` in the
     * per-diagnostic quick-fix.
     */
    private processMissingExtends;
}
