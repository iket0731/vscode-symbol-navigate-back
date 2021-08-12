import * as vscode from 'vscode';

export class LocationHistory {
	private _locations: Location[] = [];
	private _currentIndex = 0;

	public add(location: Location) {
		if (this._currentIndex < this._locations.length) {
			this._locations.splice(this._currentIndex);
		}

		this._locations.push(location);
		this._currentIndex++;
	}

	public goBack(): boolean {
		if (this._currentIndex <= 0) {
			return false;
		}

		this._currentIndex--;
		return true;
	}

	public goForward(): boolean {
		if (this._currentIndex >= this._locations.length - 1) {
			return false;
		}

		this._currentIndex++;
		return true;
	}

	public get current(): Location | undefined {
		if (this._currentIndex >= this._locations.length) {
			return undefined;
		}

		return this._locations[this._currentIndex];
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

	public equals(other: Location): boolean {
		return (this.document.fileName == other.document.fileName &&
			this.position.compareTo(other.position) == 0 &&
			this.viewColumn == other.viewColumn) ? true : false;
	}
}
