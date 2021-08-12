import * as vscode from 'vscode';

export class LocationHistory {
	private locations: Location[] = [];
	private currentIndex = 0;

	public add(location: Location) {
		if (this.currentIndex < this.locations.length) {
			this.locations.splice(this.currentIndex);
		}

		this.locations.push(location);
		this.currentIndex++;
	}

	public goBack(): boolean {
		if (this.currentIndex <= 0) {
			return false;
		}

		this.currentIndex--;
		return true;
	}

	public goForward(): boolean {
		if (this.currentIndex >= this.locations.length - 1) {
			return false;
		}

		this.currentIndex++;
		return true;
	}

	public get current(): Location | undefined {
		if (this.currentIndex >= this.locations.length) {
			return undefined;
		}

		return this.locations[this.currentIndex];
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
