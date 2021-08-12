import * as vscode from 'vscode';
import { LocationHistory, Location } from './locationHistory';

export function activate(context: vscode.ExtensionContext) {
	const core = new ExtensionCore();

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('goto-definition-history.revealDefinition', async (editor) => {
			await core.revealDefinition(editor);
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
	private history = new LocationHistory();

	public async revealDefinition(editor: vscode.TextEditor) {
		const loc = this.getCurrentLocation();
		if (loc) {
			this.history.add(loc);
		}

		await vscode.commands.executeCommand('editor.action.revealDefinition');

		const newLoc = this.getCurrentLocation();
		if (newLoc) {
			this.history.add(newLoc);
			this.history.goBack();
		}
	}

	private getCurrentLocation() {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return undefined
		}

		return new Location(editor.document, editor.selection.active, editor.viewColumn);
	}

	public async goBack() {
		if (!this.history.goBack()) {
			return;
		}

		const location = this.history.current;
		if (!location) {
			return;
		}

		await this.showInEditor(location);
	}

	public async goForward() {
		if (!this.history.goForward()) {
			return;
		}

		const location = this.history.current;
		if (!location) {
			return;
		}

		await this.showInEditor(location);
	}

	private async showInEditor(location: Location) {
		const document = location.document;
		const selection = new vscode.Selection(location.position, location.position);
		const viewColumn = location.viewColumn;

		await vscode.window.showTextDocument(document, { selection, viewColumn });
	}
}
