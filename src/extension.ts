import * as vscode from 'vscode';

let pos: vscode.Position;
let doc: vscode.TextDocument;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('goto-definition-history.revealDefinition', (editor) => {
			vscode.commands.executeCommand("editor.action.revealDefinition");
			doc = editor.document
			pos = editor.selection.active;
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('goto-definition-history.goBack', async () => {
			const editor = await vscode.window.showTextDocument(doc);
			editor.selection = new vscode.Selection(pos, pos);
			editor.revealRange(new vscode.Range(pos, pos));
		})
	);
}
