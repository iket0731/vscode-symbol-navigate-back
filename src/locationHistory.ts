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
		if (changes.length === 0) {
			return;
		}

		for (const loc of this._locations) {
			if (loc.uri.toString() !== uri.toString()) {
				continue;
			}

			let posLine = loc.position.line;
			let posChar = loc.position.character;

			// Move the position to match the change.
			for (const change of changes) {
				const changeStart = change.range.start;
				const changeEnd = change.range.end;

				const [lineBreakCount, lastLineTextLen] = this._readText(change.text);
				const lastLineStartColumn = (lineBreakCount === 0 ? changeStart.character : 0);

				if (posLine < changeStart.line || posLine === changeStart.line && posChar <= changeStart.character) {
					// pos is before changeStart ... do nothing.
				} else if (posLine > changeEnd.line || posLine === changeEnd.line && posChar >= changeEnd.character) {
					// pos is after changeEnd ... shift pos to match the change.
					posLine += changeStart.line + lineBreakCount - changeEnd.line;

					if (posLine === changeEnd.line) {
						posChar += lastLineStartColumn + lastLineTextLen - changeEnd.character;
					}
				} else {
					// pos is between changeStart and changeEnd ... move pos to the end of new text if necessary
					if (posLine >= changeStart.line + lineBreakCount) {
						posLine = changeStart.line + lineBreakCount;
						posChar = Math.min(posChar, lastLineStartColumn + lastLineTextLen);
					}
				}
			}

			loc.position = new vscode.Position(posLine, posChar);
		}
	}

	private _readText(text: string): [number, number] {
		let lineBreakCount = 0;
		let lastLinePos = 0;

		const CR = '\r'.charCodeAt(0);
		const LF = '\n'.charCodeAt(0);

		const textLen = text.length;
		for (let i = 0; i < textLen; i++) {
			const ch = text.charCodeAt(i);

			if (ch === CR || ch === LF) {
				lineBreakCount++;

				// Skip LF of CR+LF.
				if(ch === CR && i < textLen - 1 && text.charCodeAt(i + 1) === LF) {
					i++;
				}

				lastLinePos = i + 1;
			}
		}

		const lastLineLen = textLen - lastLinePos;

		return [lineBreakCount, lastLineLen];
	}
}

export class Location {
	public uri: vscode.Uri;
	public position: vscode.Position;
	public viewColumn: vscode.ViewColumn | undefined;

	constructor(uri: vscode.Uri, position: vscode.Position, viewColumn: vscode.ViewColumn | undefined) {
		this.uri = uri;
		this.position = position;
		this.viewColumn = viewColumn;
	}

	public equals(other: Location): boolean {
		return (this.uri.toString() === other.uri.toString() &&
			this.position.isEqual(other.position) &&
			this.viewColumn === other.viewColumn) ? true : false;
	}
}
