import type { FileRenameTextEdit, LspDiagnostic, LspProject } from './LspProject';
import type { Hover, Position, Range, Location, SignatureHelp, DocumentSymbol, WorkspaceSymbol, CompletionList, CancellationToken, SelectionRange, InlayHint } from 'vscode-languageserver-protocol';
import type { FileChange, MaybePromise } from '../interfaces';
import { BusyStatusTracker } from '../BusyStatusTracker';
import { PathFilterer } from './PathFilterer';
import type { Logger, LogLevel } from '../logging';
import type { BrightScriptProjectConfiguration } from '../LanguageServer';
/**
 * Manages all brighterscript projects for the language server
 */
export declare class ProjectManager {
    constructor(options?: {
        pathFilterer: PathFilterer;
        logger?: Logger;
    });
    private pathFilterer;
    private logger;
    /**
     * Collection of all projects
     */
    projects: LspProject[];
    /**
     * Collection of standalone projects. These are projects that are not part of a workspace, but are instead single files.
     * All of these are also present in the `projects` collection.
     */
    private standaloneProjects;
    private documentManager;
    static documentManagerDelay: number;
    /**
     * Maximum number of projects to activate or validate concurrently during syncProjects.
     * Limits CPU spikes when many projects are discovered (e.g. in large monorepos).
     */
    projectActivationConcurrencyLimit: number;
    busyStatusTracker: BusyStatusTracker<LspProject>;
    /**
     * Cache for PathCollection instances per project. Avoids recreating PathCollection
     * on every document flush, which is wasteful since file patterns only change when a project is reloaded.
     */
    private projectFiltererCache;
    /**
     * Get or create a cached PathCollection for the given project.
     * The filterer is invalidated when the project is removed and garbage collected.
     */
    private getProjectFilterer;
    /**
     * Apply all of the queued document changes. This should only be called as a result of the documentManager flushing changes, and never called manually
     * @param event the document changes that have occurred since the last time we applied
     */
    private flushDocumentChanges;
    /**
     * Get a standalone project for a given file path
     */
    private getStandaloneProject;
    /**
     * Create a project that validates a single file. This is useful for getting language support for files that don't belong to a project
     */
    private createStandaloneProject;
    private removeStandaloneProject;
    /**
     * A promise that's set when a sync starts, and resolved when the sync is complete
     */
    private syncPromise;
    private firstSync;
    /**
     * Monotonically increasing counter used to detect stale sync cycles.
     * When a new `syncProjects` call arrives, any in-progress activation or validation
     * from a previous cycle will see a mismatched generation and bail out.
     */
    private syncGeneration;
    /**
     * Get a promise that resolves when this manager is finished initializing
     */
    onInitialized(): Promise<[PromiseSettledResult<void>, PromiseSettledResult<void>, ...PromiseSettledResult<void>[]]>;
    /**
     * Get a promise that resolves when the project manager is idle (no pending work)
     */
    onIdle(): Promise<void>;
    /**
     * Given a list of all desired projects, create any missing projects and destroy and projects that are no longer available
     * Treat workspaces that don't have a bsconfig.json as a project.
     * Handle situations where bsconfig.json files were added or removed (to elevate/lower workspaceFolder projects accordingly)
     * Leave existing projects alone if they are not affected by these changes
     * @param workspaceConfigs an array of workspaces
     */
    syncProjects(workspaceConfigs: WorkspaceConfig[], forceReload?: boolean): Promise<void>;
    /**
     * Run async actions over a list of items with a concurrency limit.
     * Uses a worker-pool pattern: `concurrencyLimit` workers pull items from a shared queue.
     */
    private runWithConcurrencyLimit;
    private fileChangesQueue;
    handleFileChanges(changes: FileChange[]): Promise<void>;
    /**
     * Handle when files or directories are added, changed, or deleted in the workspace.
     * This is safe to call any time. Changes will be queued and flushed at the correct times
     */
    private _handleFileChanges;
    /**
     * Handle a single file change. If the file is a directory, this will recursively read all files in the directory and call `handleFileChanges` again
     */
    private handleFileChange;
    /**
     * Handle when a file is closed in the editor (this mostly just handles removing standalone projects)
     */
    handleFileClose(event: {
        srcPath: string;
    }): Promise<void>;
    /**
     * Given a project, forcibly reload it by removing it and re-adding it
     */
    private reloadProject;
    /**
     * Get all the semantic tokens for the given file
     * @returns an array of semantic tokens
     */
    getSemanticTokens(options: {
        srcPath: string;
    }): Promise<import("../interfaces").SemanticToken[]>;
    /**
     * Get a string containing the transpiled contents of the file at the given path
     * @returns the transpiled contents of the file as a string
     */
    transpileFile(options: {
        srcPath: string;
    }): Promise<import("..").FileTranspileResult>;
    /**
     *  Get the completions for the given position in the file
     */
    getCompletions(options: {
        srcPath: string;
        position: Position;
        cancellationToken?: CancellationToken;
    }): Promise<CompletionList>;
    /**
     * Get the hover information for the given position in the file. If multiple projects have hover information, the projects will be raced and
     * the fastest result will be returned
     * @returns the hover information or undefined if no hover information was found
     */
    getHover(options: {
        srcPath: string;
        position: Position;
    }): Promise<Hover>;
    /**
     * Get the definition for the symbol at the given position in the file
     * @returns a list of locations where the symbol under the position is defined in the project
     */
    getDefinition(options: {
        srcPath: string;
        position: Position;
    }): Promise<Location[]>;
    getSignatureHelp(options: {
        srcPath: string;
        position: Position;
    }): Promise<SignatureHelp>;
    getDocumentSymbol(options: {
        srcPath: string;
    }): Promise<DocumentSymbol[]>;
    getWorkspaceSymbol(): Promise<WorkspaceSymbol[]>;
    getReferences(options: {
        srcPath: string;
        position: Position;
    }): Promise<Location[]>;
    /**
     * Collect file-rename text edits from every project and reconcile them.
     * If two projects produce different replacement text for the same (uri, range), drop that edit
     * to avoid mangling source. Otherwise emit the agreed-upon edit once.
     */
    getFileRenameEdits(options: {
        oldSrcPath: string;
        newSrcPath: string;
    }): Promise<FileRenameTextEdit[]>;
    getCodeActions(options: {
        srcPath: string;
        range: Range;
    }): Promise<import("vscode-languageserver-types").CodeAction[]>;
    getFixAllCodeActions(options: {
        srcPath: string;
    }): Promise<import("vscode-languageserver-types").CodeAction[]>;
    getSelectionRanges(options: {
        srcPath: string;
        positions: Position[];
    }): Promise<SelectionRange[]>;
    getInlayHints(options: {
        srcPath: string;
        range: Range;
    }): Promise<InlayHint[]>;
    /**
     * Scan a given workspace for all `bsconfig.json` files. If at least one is found, then only folders who have bsconfig.json are returned.
     * If none are found, then the workspaceFolder itself is treated as a project
     */
    private discoverProjectsForWorkspace;
    /**
     * Returns true if we have this project, or false if we don't
     * @returns true if the project exists, or false if it doesn't
     */
    private hasProject;
    /**
     * Get a project with the specified path
     * @param param path to the project or an obj that has `projectPath` prop
     * @returns a project, or undefined if no project was found
     */
    private getProject;
    /**
     * Remove a project from the language server
     */
    private removeProject;
    /**
     * A unique project counter to help distinguish log entries in lsp mode
     */
    private static projectNumberSequence;
    private static projectNumberCache;
    /**
     * Get a projectNumber for a given config. Try to reuse project numbers when we've seen this project before
     *  - If the config already has one, use that.
     *  - If we've already seen this config before, use the same project number as before
     */
    private getProjectNumber;
    /**
     * Constructs a project for the given config. Just makes the project, doesn't activate it
     * @returns a new project, or the existing project if one already exists with this config info
     */
    private constructProject;
    /**
     * Constructs a project for the given config
     * @returns a new project, or the existing project if one already exists with this config info
     */
    private createAndActivateProject;
    private activateProject;
    on(eventName: 'validate-begin', handler: (data: {
        project: LspProject;
    }) => MaybePromise<void>): any;
    on(eventName: 'validate-end', handler: (data: {
        project: LspProject;
    }) => MaybePromise<void>): any;
    on(eventName: 'critical-failure', handler: (data: {
        project: LspProject;
        message: string;
    }) => MaybePromise<void>): any;
    on(eventName: 'project-activate', handler: (data: {
        project: LspProject;
    }) => MaybePromise<void>): any;
    on(eventName: 'diagnostics', handler: (data: {
        project: LspProject;
        diagnostics: LspDiagnostic[];
    }) => MaybePromise<void>): any;
    private emit;
    private emitter;
    dispose(): void;
}
export interface WorkspaceConfig {
    /**
     * Absolute path to the folder where the workspace resides
     */
    workspaceFolder: string;
    /**
     * A list of glob patterns used to _exclude_ files from various bsconfig searches
     */
    excludePatterns?: string[];
    /**
     * A list of project paths that should be used to create projects in place of discovery.
     */
    projects?: BrightScriptProjectConfiguration[];
    /**
     * Language server configuration options
     */
    languageServer: {
        /**
         * Should the projects in this workspace be run in their own dedicated worker threads, or all run on the main thread
         */
        enableThreading: boolean;
        /**
         * Should the language server automatically discover projects in this workspace?
         */
        enableProjectDiscovery: boolean;
        /**
         * A list of glob patterns used to _exclude_ files from project discovery
         */
        projectDiscoveryExclude?: Record<string, boolean>;
        /**
         * The log level to use for this workspace
         */
        logLevel?: LogLevel | string;
        /**
         * Maximum depth to search for Roku projects
         */
        projectDiscoveryMaxDepth?: number;
        /**
         * The maximum number of projects that can be activated concurrently
         */
        projectActivationConcurrencyLimit?: number;
    };
}
