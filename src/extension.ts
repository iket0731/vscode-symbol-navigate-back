import * as vscode from 'vscode';
import { LocationHistory, Location } from './locationHistory';

export function activate(context: vscode.ExtensionContext) {
	const core = new ExtensionCore();

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.revealDefinition', async (editor) => {
			await core.navigate(editor, 'editor.action.revealDefinition');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.revealDefinitionAside', async (editor) => {
			await core.navigate(editor, 'editor.action.revealDefinitionAside');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.revealDeclaration', async (editor) => {
			await core.navigate(editor, 'editor.action.revealDeclaration');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.goToTypeDefinition', async (editor) => {
			await core.navigate(editor, 'editor.action.goToTypeDefinition');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.goToImplementation', async (editor) => {
			await core.navigate(editor, 'editor.action.goToImplementation');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.goToReferences', async (editor) => {
			await core.navigate(editor, 'editor.action.goToReferences');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbol-navigate-back.showAllSymbols', async (editor) => {
			await core.navigate(editor, 'workbench.action.showAllSymbols');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('symbol-navigate-back.goBack', async () => {
			await core.goBack();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('symbol-navigate-back.goForward', async () => {
			await core.goForward();
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(event => {
			core.handleDidChangeTextDocument(event);
		})
	);
}

class ExtensionCore {
	private _history = new LocationHistory();

	public async navigate(editor: vscode.TextEditor, command: string) {
		const loc = this._getCurrentLocation(editor);
		if (!loc) {
			return;
		}

		this._history.add(loc);
		await vscode.commands.executeCommand(command);
	}

	private _getCurrentLocation(editor: vscode.TextEditor) {
		const offset = editor.document.offsetAt(editor.selection.active);
		return new Location(editor.document.uri, offset, editor.viewColumn);
	}

	public async goBack() {
		if (!this._history.goBack()) {
			return;
		}

		const loc = this._history.current;
		if (!loc) {
			return;
		}

		await this._showInEditor(loc);
	}

	public async goForward() {
		if (!this._history.goForward()) {
			return;
		}

		const loc = this._history.current;
		if (!loc) {
			return;
		}

		await this._showInEditor(loc);
	}

	private async _showInEditor(loc: Location) {
		const doc = await vscode.workspace.openTextDocument(loc.uri);
		const pos = doc.positionAt(loc.offset);
		await vscode.window.showTextDocument(doc, {
			selection: new vscode.Selection(pos, pos),
			viewColumn: loc.viewColumn
		});
	}

	public handleDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
		this._history.acceptDocumentChanges(event.document.uri, event.contentChanges);
	}
}
