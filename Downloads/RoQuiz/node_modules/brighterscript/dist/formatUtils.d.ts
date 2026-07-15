/**
 * Standalone formatting helpers with no project dependencies. This module must stay dependency-free
 * so that low-level modules (Logger, Stopwatch) can import it without creating circular imports.
 */
/**
 * Break a millisecond duration down into its time-unit parts. Mirrors the behavior of the `parse-ms` package
 * for the units we care about (minutes, seconds, milliseconds).
 */
export declare function parseMilliseconds(milliseconds: number): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
};
/**
 * Format a `Date` as a 12-hour `hh:mm:ss:SSSS A` timestamp (e.g. `03:07:13:8460 PM`).
 * Replaces the single `moment().format('hh:mm:ss:SSSS A')` call previously used by the legacy Logger.
 */
export declare function formatTimestamp(date?: Date): string;
