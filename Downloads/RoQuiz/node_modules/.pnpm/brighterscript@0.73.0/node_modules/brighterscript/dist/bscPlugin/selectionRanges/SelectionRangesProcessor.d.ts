import type { ProvideSelectionRangesEvent } from '../../interfaces';
export declare class SelectionRangesProcessor {
    event: ProvideSelectionRangesEvent;
    constructor(event: ProvideSelectionRangesEvent);
    process(): void;
    private buildSelectionRange;
}
