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
		vscode.commands.registerCommand('symbol-navigate-back.goBack', async () => {
			await core.goBack();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('symbol-navigate-back.goForward', async () => {
			await core.goForward();
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
		return new Location(editor.document, editor.selection.active, editor.viewColumn);
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

	private async _showInEditor(location: Location) {
		const document = location.document;
		const selection = new vscode.Selection(location.position, location.position);
		const viewColumn = location.viewColumn;

		await vscode.window.showTextDocument(document, { selection, viewColumn });
	}
}
