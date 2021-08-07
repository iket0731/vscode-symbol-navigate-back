import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const navigation = new Navigation();

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('goto-definition-history.revealDefinition', (editor) => {
			navigation.revealDefinition(editor);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('goto-definition-history.goBack', () => {
			navigation.goBack();
		})
	);
}

class Navigation {
	private history = new LocationHistory();

	public revealDefinition(editor: vscode.TextEditor) {
		const location = new Location(editor.document, editor.selection.active, editor.viewColumn);
		this.history.add(location);

		vscode.commands.executeCommand("editor.action.revealDefinition");
	}

	public goBack() {
		this.history.back();

		const location = this.history.current();
		if (!location) {
			return;
		}

		const document = location.document;
		const selection = new vscode.Selection(location.position, location.position);
		const viewColumn = location.viewColumn;
		vscode.window.showTextDocument(document, { selection, viewColumn });
	}
}

class LocationHistory {
	private locations: Location[] = [];
	private index = 0;

	public add(location: Location) {
		if (this.index < this.locations.length) {
			this.locations.splice(this.index);
		}

		this.locations.push(location);
		this.index++;
	}

	public back() {
		if (this.index <= 0) {
			return;
		}

		this.index--;
	}

	public forward() {
		if (this.index >= this.locations.length) {
			return;
		}

		this.index++;
	}

	public current(): Location | undefined {
		if (this.index >= this.locations.length) {
			return undefined;
		}

		return this.locations[this.index];
	}
}

class Location {
	public readonly document: vscode.TextDocument;
	public readonly position: vscode.Position;
	public readonly viewColumn: vscode.ViewColumn | undefined;

	constructor(document: vscode.TextDocument, position: vscode.Position, viewColumn: vscode.ViewColumn | undefined) {
		this.document = document;
		this.position = position;
		this.viewColumn = viewColumn;
	}
}