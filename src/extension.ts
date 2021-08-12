import * as vscode from 'vscode';
import { LocationHistory, Location } from './locationHistory';

export function activate(context: vscode.ExtensionContext) {
	const core = new ExtensionCore();

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('goto-definition-history.revealDefinition', (editor) => {
			core.revealDefinition(editor);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('goto-definition-history.goBack', () => {
			core.goBack();
		})
	);
}

class ExtensionCore {
	private history = new LocationHistory();

	public revealDefinition(editor: vscode.TextEditor) {
		const location = new Location(editor.document, editor.selection.active, editor.viewColumn);
		this.history.add(location);

		vscode.commands.executeCommand('editor.action.revealDefinition');
	}

	public goBack() {
		if (!this.history.goBack()) {
			return;
		}

		const location = this.history.current;
		if (!location) {
			return;
		}

		const document = location.document;
		const selection = new vscode.Selection(location.position, location.position);
		const viewColumn = location.viewColumn;
		vscode.window.showTextDocument(document, { selection, viewColumn });
	}
}
