import type { Scope, NamespaceContainer } from './Scope';
/**
 * The per-scope namespace lookup. Implements `Map<string, NamespaceContainer>` so existing
 * plugin and internal consumers (which iterate, `.get`, `.has`, `.size`, etc.) keep working.
 *
 * Internally lazy: `get(name)` builds the container for that name only, by intersecting
 * the program-level `(name -> contributing files)` map with the scope's file set.
 *
 * Sharing primitives:
 *  - When exactly one in-scope file contributes to a namespace (the dominant case under
 *    a typical build), the container's heavy fields point directly at the file's pre-built
 *    `NamespaceFileContribution` data — including its symbolTable. Two scopes pulling in
 *    the same file get containers wrapping the same inner data.
 *  - When multiple in-scope files contribute, the container is built per-scope by merging
 *    contributions. This path is rare in practice but must be correct: it covers cases
 *    where a namespace is split across files that are all in the same scope (e.g. a shared
 *    declaration file plus theme-specific extensions).
 *
 * Iteration (`keys` / `values` / `entries` / `forEach`) populates every container, since
 * "give me everything" callers don't benefit from laziness. This matches the cost of the
 * pre-Phase-4 `buildNamespaceLookup` and only fires from LSP completion paths.
 */
export declare class ScopeNamespaceLookup extends Map<string, NamespaceContainer> {
    private readonly scope;
    constructor(scope: Scope);
    /**
     * Lower-cased name parts contributed by any file in scope. Built once per lookup
     * instance, used as the "does this namespace exist in scope" oracle for `has` and
     * for driving iteration.
     */
    private nameSet;
    /** Map from lower-cased parent name to lower-cased immediate child names. */
    private childrenByParent;
    /** Cached `Set<BrsFile>` for `scope.getAllFiles()`, used when filtering contributors. */
    private inScopeBrsFiles;
    /** Set to true after `populateAll` runs so iteration doesn't keep re-checking. */
    private isFullyBuilt;
    private ensureNameIndex;
    private getInScopeBrsFiles;
    has(key: string): boolean;
    get(key: string): NamespaceContainer | undefined;
    get size(): number;
    keys(): IterableIterator<string>;
    values(): IterableIterator<NamespaceContainer>;
    entries(): IterableIterator<[string, NamespaceContainer]>;
    [Symbol.iterator](): IterableIterator<[string, NamespaceContainer]>;
    forEach(callback: (value: NamespaceContainer, key: string, map: Map<string, NamespaceContainer>) => void, thisArg?: any): void;
    private populateAll;
    private buildContainer;
    /**
     * Fast path: single in-scope contributor. The wrapper is per-scope (so its
     * `namespaces` field can hold scope-specific children), but every other field
     * points directly at the contribution's pre-built data.
     */
    private wrapSingleContribution;
    /**
     * Slow path: multiple in-scope contributors. The merged statement collections and
     * symbolTable live at the program level (`Program.getAggregateNamespaceContainer`),
     * keyed by `(nameLower, sorted-contributor-pkgPaths)`. Two scopes with the same
     * in-scope file set for this namespace share the same aggregate object, just like
     * the fast path shares the per-file contribution.
     *
     * The wrapper container itself is per-scope so its `namespaces` (children) field can
     * reflect the querying scope's file set.
     */
    private aggregateContributions;
    /**
     * Build the scope-filtered children map for a parent namespace. Walks the
     * pre-computed `childrenByParent` index and recursively materializes each
     * in-scope child container.
     */
    private buildScopedChildren;
}
