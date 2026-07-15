import type { BeforeFileTranspileEvent, Plugin, OnFileValidateEvent, OnGetCodeActionsEvent, OnGetSourceFixAllCodeActionsEvent, ProvideHoverEvent, OnGetSemanticTokensEvent, OnScopeValidateEvent, ProvideCompletionsEvent, ProvideDefinitionEvent, ProvideReferencesEvent, ProvideDocumentSymbolsEvent, ProvideWorkspaceSymbolsEvent, ProvideSelectionRangesEvent, ProvideInlayHintsEvent } from '../interfaces';
import type { Program } from '../Program';
export declare class BscPlugin implements Plugin {
    name: string;
    onGetCodeActions(event: OnGetCodeActionsEvent): void;
    onGetSourceFixAllCodeActions(event: OnGetSourceFixAllCodeActionsEvent): void;
    provideHover(event: ProvideHoverEvent): void;
    provideDocumentSymbols(event: ProvideDocumentSymbolsEvent): import("vscode-languageserver-types").DocumentSymbol[];
    provideWorkspaceSymbols(event: ProvideWorkspaceSymbolsEvent): import("vscode-languageserver-types").WorkspaceSymbol[];
    provideCompletions(event: ProvideCompletionsEvent): void;
    provideDefinition(event: ProvideDefinitionEvent): void;
    provideReferences(event: ProvideReferencesEvent): void;
    provideSelectionRanges(event: ProvideSelectionRangesEvent): void;
    provideInlayHints(event: ProvideInlayHintsEvent): void;
    onGetSemanticTokens(event: OnGetSemanticTokensEvent): void;
    onFileValidate(event: OnFileValidateEvent): void;
    private scopeValidator;
    onScopeValidate(event: OnScopeValidateEvent): void;
    afterProgramValidate(program: Program): void;
    beforeFileTranspile(event: BeforeFileTranspileEvent): void;
}
