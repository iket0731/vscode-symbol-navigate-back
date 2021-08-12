import * as vscode from 'vscode';
import { LocationHistory, Location } from './locationHistory';

export function activate(context: vscode.ExtensionContext) {
	const core = new ExtensionCore();

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('goto-definition-history.revealDefinition', async (editor) => {
			await core.executeCommand('editor.action.revealDefinition');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('goto-definition-history.goBack', async () => {
			await core.goBack();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('goto-definition-history.goForward', async () => {
			await core.goForward();
		})
	);
}

class ExtensionCore {
	private _history = new LocationHistory();

	public async executeCommand(command: string) {
		const oldLoc = this._getCurrentLocation();
		await vscode.commands.executeCommand(command);
		const newLoc = this._getCurrentLocation();

		if (oldLoc && newLoc && !oldLoc.equals(newLoc)) {
			this._history.add(oldLoc);
			this._history.add(newLoc);
			this._history.goBack();
		}
	}

	private _getCurrentLocation() {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return undefined
		}

		return new Location(editor.document, editor.selection.active, editor.viewColumn);
	}

	public async goBack() {
		if (!this._history.goBack()) {
			return;
		}

		const location = this._history.current;
		if (!location) {
			return;
		}

		await this._showInEditor(location);
	}

	public async goForward() {
		if (!this._history.goForward()) {
			return;
		}

		const location = this._history.current;
		if (!location) {
			return;
		}

		await this._showInEditor(location);
	}

	private async _showInEditor(location: Location) {
		const document = location.document;
		const selection = new vscode.Selection(location.position, location.position);
		const viewColumn = location.viewColumn;

		await vscode.window.showTextDocument(document, { selection, viewColumn });
	}
}
