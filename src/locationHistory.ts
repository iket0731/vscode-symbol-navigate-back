import * as vscode from 'vscode';

export class LocationHistory {
	private _locations: Location[] = [];
	private _currentIndex = 0;
	private readonly _locationsLimit = 128;

	public add(location: Location) {
		if (this._currentIndex < this._locations.length) {
			this._locations.splice(this._currentIndex);
		}

		if (this._locations.length === 0 || !location.equals(this._locations[this._locations.length - 1])) {
			this._locations.push(location);
			this._currentIndex++;
		}

		// Ensure that the number of locations does not exceed the limit.
		while (this._locations.length > this._locationsLimit) {
			this._locations.shift();
			this._currentIndex--;
		}
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

	public get locations(): readonly Location[] {
		return this._locations;
	}

	public get current(): Location | undefined {
		if (this._currentIndex >= this._locations.length) {
			return undefined;
		}

		return this._locations[this._currentIndex];
	}

	public get currentIndex(): number {
		return this._currentIndex;
	}

	public acceptDocumentChanges(uri: vscode.Uri, changes: readonly vscode.TextDocumentContentChangeEvent[]) {
		for (let i = this._locations.length - 1; i >= 0; i--) {
			const loc = this._locations[i];
			let delta = 0;
			let removed = false;

			for (const change of changes) {
				if (loc.uri.toString() !== uri.toString()) {
					continue;
				}

				if (loc.offset >= change.rangeOffset + change.rangeLength) {
					// Move the location to match the change.
					delta += change.text.length - change.rangeLength;
				} else if (loc.offset >= change.rangeOffset) {
					// Remove the location.
					this._locations.splice(i, 1);
					removed = true;

					if (this._currentIndex >= i) {
						this._currentIndex--;
					}

					break;
				}
			}

			if (!removed) {
				loc.offset += delta;
			}
		}
	}
}

export class Location {
	public uri: vscode.Uri;
	public offset: number;
	public viewColumn: vscode.ViewColumn | undefined;

	constructor(uri: vscode.Uri, offset: number, viewColumn: vscode.ViewColumn | undefined) {
		this.uri = uri;
		this.offset = offset;
		this.viewColumn = viewColumn;
	}

	public equals(other: Location): boolean {
		return (this.uri.toString() === other.uri.toString() &&
			this.offset === other.offset &&
			this.viewColumn === other.viewColumn) ? true : false;
	}
}
