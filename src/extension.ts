import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('goto-definition-history.revealDefinition', () => {
		revealDefinition();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
}

function revealDefinition() {
	vscode.commands.executeCommand("editor.action.revealDefinition");
}
