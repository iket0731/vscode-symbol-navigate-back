import * as vscode from 'vscode';

export class LocationHistory {
	private locations: Location[] = [];
	private index = 0;

	public save(location: Location) {
		if (this.index < this.locations.length) {
			this.locations.splice(this.index);
		}

		this.locations.push(location);
		this.index++;
	}

	public undo() {
		if (this.index <= 0) {
			return;
		}

		this.index--;
	}

	public redo() {
		if (this.index >= this.locations.length - 1) {
			return;
		}

		this.index++;
	}

	public get current(): Location | undefined {
		if (this.index >= this.locations.length) {
			return undefined;
		}

		return this.locations[this.index];
	}
}

export class Location {
	public readonly document: vscode.TextDocument;
	public readonly position: vscode.Position;
	public readonly viewColumn: vscode.ViewColumn | undefined;

	constructor(document: vscode.TextDocument, position: vscode.Position, viewColumn: vscode.ViewColumn | undefined) {
		this.document = document;
		this.position = position;
		this.viewColumn = viewColumn;
	}
}
