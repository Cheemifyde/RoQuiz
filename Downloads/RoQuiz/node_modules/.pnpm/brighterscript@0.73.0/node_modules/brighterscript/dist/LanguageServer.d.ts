import type { CompletionItem, DidChangeWatchedFilesParams, InitializeParams, TextDocumentPositionParams, ExecuteCommandParams, WorkspaceSymbolParams, DocumentSymbolParams, ReferenceParams, SignatureHelpParams, CodeActionParams, HandlerResult, InitializeError, InitializeResult, CompletionParams, ResultProgressReporter, WorkDoneProgressReporter, CompletionList, CancellationToken, DidChangeConfigurationParams, SelectionRangeParams, RenameFilesParams, WorkspaceEdit, InlayHint, InlayHintParams } from 'vscode-languageserver/node';
import { LogLevel } from './logging';
export declare class LanguageServer {
    /**
     * The default threading setting for the language server. Can be overridden by per-workspace settings
     */
    static enableThreadingDefault: boolean;
    /**
     * The default project discovery setting for the language server. Can be overridden by per-workspace settings
     */
    static enableProjectDiscoveryDefault: boolean;
    /**
     * The default number of projects that are permitted to activate concurrently.
     */
    private static projectActivationConcurrencyLimitDefault;
    /**
     * The language server protocol connection, used to send and receive all requests and responses
     */
    private connection;
    /**
     * Manages all projects for this language server
     */
    private projectManager;
    private hasConfigurationCapability;
    /**
     * Indicates whether the client supports workspace folders
     */
    private clientHasWorkspaceFolderCapability;
    /**
     * Create a simple text document manager.
     * The text document manager supports full document sync only
     */
    private documents;
    private loggerSubscription;
    /**
     * Used to filter paths based on include/exclude lists (like .gitignore or vscode's `files.exclude`).
     * This is used to prevent the language server from being overwhelmed by files we don't actually want to handle
     */
    private pathFilterer;
    logger: import("@rokucommunity/logger").Logger;
    constructor();
    run(): void;
    /**
     * Called when the client starts initialization
     */
    onInitialize(params: InitializeParams): HandlerResult<InitializeResult, InitializeError>;
    /**
     * Called when the client has finished initializing
     */
    onInitialized(): Promise<void>;
    /**
     * Set our logLevel to the most verbose log level found across all projects and workspaces
     */
    private syncLogLevel;
    /**
     * Get the project activation concurrency limit from all workspaces and set the project manager's concurrency limit to the lowest value found.
     * This ensures that if the user has multiple workspaces open with different limits,
     * we respect the most restrictive limit to avoid overwhelming the user's machine.
     */
    private syncProjectActivationConcurrencyLimit;
    private onTextDocumentDidChangeContent;
    /**
     * Pending file changes waiting to be flushed after the debounce period
     */
    private pendingFileChanges;
    /**
     * Timer handle for the file change debounce
     */
    private fileChangeDebounceTimer;
    /**
     * How long to wait (in ms) after the last file change event before processing the batch.
     * This prevents excessive revalidation during bulk operations like `git checkout` or package installs.
     */
    fileChangeDebounceDelay: number;
    /**
     * Called when watched files changed (add/change/delete).
     * The CLIENT is in charge of what files to watch, so all client
     * implementations should ensure that all valid project
     * file types are watched (.brs,.bs,.xml,manifest, and any json/text/image files)
     *
     * File changes are debounced to batch rapid successive events (e.g. during builds or VCS operations)
     * into a single processing pass, reducing redundant work across projects.
     */
    onDidChangeWatchedFiles(params: DidChangeWatchedFilesParams): Promise<void>;
    /**
     * Deferred for the current pending file changes batch
     */
    private pendingFileChangesDeferred;
    /**
     * Flush all pending file changes accumulated during the debounce window
     */
    private flushFileChanges;
    private onDocumentClose;
    /**
     * Provide a list of completion items based on the current cursor position
     */
    onCompletion(params: CompletionParams, cancellationToken: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress: ResultProgressReporter<CompletionItem[]>): Promise<CompletionList>;
    /**
     * Get a list of workspaces, and their configurations.
     * Get only the settings for the workspace that are relevant to the language server. We do this so we can cache this object for use in change detection in the future.
     */
    private getWorkspaceConfigs;
    /**
     * Extract project paths from settings' projects list, expanding the workspaceFolder variable if necessary
     */
    private normalizeProjectPaths;
    private workspaceConfigsCache;
    onDidChangeConfiguration(args: DidChangeConfigurationParams): Promise<void>;
    onHover(params: TextDocumentPositionParams): Promise<import("vscode-languageserver-types").Hover>;
    onWorkspaceSymbol(params: WorkspaceSymbolParams): Promise<import("vscode-languageserver-types").WorkspaceSymbol[]>;
    onSelectionRanges(params: SelectionRangeParams): Promise<import("vscode-languageserver-types").SelectionRange[]>;
    onInlayHint(params: InlayHintParams): Promise<InlayHint[]>;
    onDocumentSymbol(params: DocumentSymbolParams): Promise<import("vscode-languageserver-types").DocumentSymbol[]>;
    onDefinition(params: TextDocumentPositionParams): Promise<import("vscode-languageserver-types").Location[]>;
    onSignatureHelp(params: SignatureHelpParams): Promise<import("vscode-languageserver-types").SignatureHelp>;
    onReferences(params: ReferenceParams): Promise<import("vscode-languageserver-types").Location[]>;
    onWillRenameFiles(params: RenameFilesParams): Promise<WorkspaceEdit | null>;
    private onFullSemanticTokens;
    onCodeAction(params: CodeActionParams): Promise<any[]>;
    onExecuteCommand(params: ExecuteCommandParams): Promise<import("./Program").FileTranspileResult>;
    /**
     * Establish a connection to the client if not already connected
     */
    private establishConnection;
    /**
     * Send a new busy status notification to the client based on the current busy status
     */
    private sendBusyStatus;
    private busyStatusIndex;
    private pathFiltererDisposables;
    /**
     * Populate the path filterer with the client's include/exclude lists and the projects include lists
     * @returns the instance of the path filterer
     */
    private rebuildPathFilterer;
    /**
     * Ask the client for the list of `files.exclude` and `files.watcherExclude` patterns. Useful when determining if we should process a file
     */
    private getWorkspaceExcludeGlobs;
    private extractExcludes;
    /**
     * Ask the project manager to sync all projects found within the list of workspaces
     * @param forceReload if true, all projects are discarded and recreated from scratch
     */
    private syncProjects;
    /**
     * Given a workspaceFolder path, get the specified configuration from the client (if applicable).
     * Be sure to use optional chaining to traverse the result in case that configuration doesn't exist or the client doesn't support `getConfiguration`
     * @param workspaceFolder the folder for the workspace in the client
     */
    private getClientConfiguration;
    /**
     * Send a critical failure notification to the client, which should show a notification of some kind
     */
    private sendCriticalFailure;
    /**
     * Send diagnostics to the client
     */
    private sendDiagnostics;
    private diagnosticCollection;
    protected dispose(): void;
}
export declare enum CustomCommands {
    TranspileFile = "TranspileFile"
}
export declare enum NotificationName {
    busyStatus = "busyStatus"
}
declare type Handler<T> = {
    [K in keyof T as K extends `on${string}` ? K : never]: T[K] extends (arg: infer U) => void ? (arg: U) => void : never;
};
export declare type OnHandler<T> = {
    [K in keyof Handler<T>]: Handler<T>[K] extends (arg: infer U) => void ? U : never;
};
export interface BrightScriptProjectConfiguration {
    name?: string;
    path: string;
    disabled?: boolean;
}
export interface BrightScriptClientConfiguration {
    projects?: (string | BrightScriptProjectConfiguration)[];
    languageServer: {
        enableThreading: boolean;
        enableProjectDiscovery: boolean;
        projectDiscoveryExclude?: Record<string, boolean>;
        logLevel: LogLevel | string;
        projectDiscoveryMaxDepth?: number;
        projectActivationConcurrencyLimit?: number;
    };
}
export {};
