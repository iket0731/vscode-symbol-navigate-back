import * as vscode from 'vscode';
import { LocationHistory, Location } from './locationHistory';

export function activate(context: vscode.ExtensionContext) {
	const core = new ExtensionCore();

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.revealDefinition', async (editor) => {
			await core.navigateToSymbol(editor, 'editor.action.revealDefinition');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.revealDeclaration', async (editor) => {
			await core.navigateToSymbol(editor, 'editor.action.revealDeclaration');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.goToTypeDefinition', async (editor) => {
			await core.navigateToSymbol(editor, 'editor.action.goToTypeDefinition');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.goToImplementation', async (editor) => {
			await core.navigateToSymbol(editor, 'editor.action.goToImplementation');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.goToReferences', async (editor) => {
			await core.navigateToSymbol(editor, 'editor.action.goToReferences');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.executeCommand', async (editor, edit, command, ...args) => {
			if (command && typeof command === 'string') {
				await core.navigateToSymbol(editor, command, args);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('symbolNavigateBack.saveCurrentPosition', async (editor) => {
			await core.saveCurrentPosition(editor);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('symbolNavigateBack.navigateBack', async () => {
			await core.navigateBack();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('symbolNavigateBack.navigateForward', async () => {
			await core.navigateForward();
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => {
			core.handleDidChangeTextDocument(e);
		})
	);
}

class ExtensionCore {
	private _history = new LocationHistory();

	public async navigateToSymbol(editor: vscode.TextEditor, command: string, ...args: any[]) {
		this.saveCurrentPosition(editor);

		await vscode.commands.executeCommand(command, args);
	}

	public async saveCurrentPosition(editor: vscode.TextEditor) {
		const loc = this._getCurrentLocation(editor);
		if (!loc) {
			return;
		}

		this._history.add(loc);
	}

	private _getCurrentLocation(editor: vscode.TextEditor) {
		return new Location(editor.document.uri, editor.selection.active, editor.viewColumn);
	}

	public async navigateBack() {
		// Add current position to the history if there is no entry for navigateFoward.
		if (!this._history.current) {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				this._history.add(this._getCurrentLocation(editor));
				this._history.goBack();
			}
		}

		this._history.goBack();

		const loc = this._history.current;
		if (!loc) {
			return;
		}

		await this._showInEditor(loc);
	}

	public async navigateForward() {
		this._history.goForward();

		const loc = this._history.current;
		if (!loc) {
			return;
		}

		await this._showInEditor(loc);
	}

	private async _showInEditor(loc: Location) {
		const doc = await vscode.workspace.openTextDocument(loc.uri);
		const pos = loc.position;
		const editor = await vscode.window.showTextDocument(doc, { viewColumn: loc.viewColumn });

		editor.selection = new vscode.Selection(pos, pos);
		editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
	}

	public handleDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
		this._history.acceptDocumentChanges(e.document.uri, e.contentChanges);
	}
}
