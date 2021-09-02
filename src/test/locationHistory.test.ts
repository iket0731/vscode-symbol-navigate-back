import * as path from 'path';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { LocationHistory, Location } from '../locationHistory';

suite('LocationHistory - add, goBack, goForward', () => {
	let history: LocationHistory
	let docA: vscode.TextDocument;
	let docB: vscode.TextDocument;
	let loc1: Location;
	let loc2: Location;
	let loc3: Location;

	setup(async () => {
		history = new LocationHistory();
		docA = await vscode.workspace.openTextDocument(path.resolve(__dirname, "../../test_fixture/docA.txt"));
		docB = await vscode.workspace.openTextDocument(path.resolve(__dirname, "../../test_fixture/docB.txt"));
		loc1 = new Location(docA.uri, new vscode.Position(15, 1), vscode.ViewColumn.One);
		loc2 = new Location(docB.uri, new vscode.Position(38, 29), vscode.ViewColumn.Two);
		loc3 = new Location(docB.uri, new vscode.Position(1, 16), vscode.ViewColumn.Two);
	});

	test('add', () => {
		history.add(loc1);
		assert.strictEqual(history.current, undefined);

		history.add(loc2);
		assert.strictEqual(history.current, undefined);
	});

	test('add - limit for the number of locations', () => {
		for (let i = 0; i < 150; i++) {
			const loc = new Location(docA.uri, new vscode.Position(i, 1), vscode.ViewColumn.One);
			history.add(loc);
		}

		assert.strictEqual(history.locations.length, 128);
		assert.strictEqual(history.locations[0].position.line, 22);
		assert.strictEqual(history.locations[1].position.line, 23);
		assert.strictEqual(history.locations[126].position.line, 148);
		assert.strictEqual(history.locations[127].position.line, 149);
		assert.strictEqual(history.currentIndex, 128);
	});

	test('goBack', () => {
		history.add(loc1);
		history.add(loc2);
		history.add(loc3);

		let ret = history.goBack();
		assert.strictEqual(ret, true);
		assert.strictEqual(history.current, loc3);

		ret = history.goBack();
		assert.strictEqual(ret, true);
		assert.strictEqual(history.current, loc2);

		ret = history.goBack();
		assert.strictEqual(ret, true);
		assert.strictEqual(history.current, loc1);

		ret = history.goBack();
		assert.strictEqual(ret, false);
		assert.strictEqual(history.current, loc1);
	});

	test('goForward', () => {
		history.add(loc1);
		history.add(loc2);
		history.add(loc3);
		history.goBack();
		history.goBack();
		history.goBack();

		let ret = history.goForward();
		assert.strictEqual(ret, true);
		assert.strictEqual(history.current, loc2);

		ret = history.goForward();
		assert.strictEqual(ret, true);
		assert.strictEqual(history.current, loc3);

		ret = history.goForward();
		assert.strictEqual(ret, true);
		assert.strictEqual(history.current, undefined);

		ret = history.goForward();
		assert.strictEqual(ret, false);
		assert.strictEqual(history.current, undefined);
	});

	test('combination case 1', () => {
		history.add(loc1);
		history.add(loc2);
		history.goBack();

		history.add(loc3);
		assert.strictEqual(history.current, undefined);

		history.goBack();
		assert.strictEqual(history.current, loc3);

		history.goBack();
		assert.strictEqual(history.current, loc1);

		history.goForward();
		assert.strictEqual(history.current, loc3);

		history.goBack();
		assert.strictEqual(history.current, loc1);
	});

	test('combination case 2', () => {
		history.add(loc1);
		history.add(loc2);
		history.goBack();
		history.goBack();

		history.add(loc3);
		assert.strictEqual(history.current, undefined);

		history.goBack();
		assert.strictEqual(history.current, loc3);

		let ret = history.goBack();
		assert.strictEqual(ret, false);
	});
});

suite('LocationHistory - acceptDocumentChanges', () => {
	let history: LocationHistory
	let docA: vscode.TextDocument;
	let docB: vscode.TextDocument;
	let loc1: Location;
	let loc2: Location;
	let loc3: Location;
	let disposable: vscode.Disposable;

	setup(async () => {
		history = new LocationHistory();
		docA = await vscode.workspace.openTextDocument(path.resolve(__dirname, "../../test_fixture/docA.txt"));
		docB = await vscode.workspace.openTextDocument(path.resolve(__dirname, "../../test_fixture/docB.txt"));
		loc1 = new Location(docA.uri, new vscode.Position(15, 1), vscode.ViewColumn.One);
		loc2 = new Location(docB.uri, new vscode.Position(37, 29), vscode.ViewColumn.Two);
		loc3 = new Location(docB.uri, new vscode.Position(1, 16), vscode.ViewColumn.Two);

		history.add(loc1);
		history.add(loc2);
		history.add(loc3);
		history.goBack();

		disposable = vscode.workspace.onDidChangeTextDocument(e => {
			history.acceptDocumentChanges(e.document.uri, e.contentChanges);
		});
	});

	teardown(async () => {
		disposable.dispose();
		await vscode.commands.executeCommand('undo');
	})

	suite('Change the range before the loc2 line', () => {
		test('multi-line range -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(15, 1, 17, 30), 'abc');
				editBuilder.replace(new vscode.Range(27, 5, 30, 5), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 32); // 37 -> 32
			assert.strictEqual(history.locations[1].position.character, 29);
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});
	});

	suite('Change the range on the loc2 line', () => {
		test('single-line range (before loc2) -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(37, 20, 37, 25), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 37);
			assert.strictEqual(history.locations[1].position.character, 27); // 29 -> 27
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});

		test('single-line range (before loc2) -> multi-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(37, 20, 37, 25), 'abc\rdefg\nhijkl\r\nzz');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 40); // 37 -> 40
			assert.strictEqual(history.locations[1].position.character, 29);
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});

		test('multi-line range (before loc2) -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(30, 20, 37, 25), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 30); // 37 -> 30
			assert.strictEqual(history.locations[1].position.character, 29);
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});

		test('single-line range (including loc2) -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(37, 20, 37, 35), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 37);
			assert.strictEqual(history.locations[1].position.character, 23); // 29 -> 23
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});

		test('single-line range (including loc2) -> multi-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(37, 20, 37, 35), 'abc\ndefg\nghijk');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 37);
			assert.strictEqual(history.locations[1].position.character, 29);
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});

		test('multi-line range (including loc2) -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(36, 10, 39, 10), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 36); // 37 -> 36
			assert.strictEqual(history.locations[1].position.character, 13); // 29 -> 13
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});

		test('single-line range (after loc2) -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(37, 30, 37, 35), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 37);
			assert.strictEqual(history.locations[1].position.character, 29);
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});
	});

	suite('Change the range after the loc2 line', () => {
		test('multi-line range -> single-line range', async () => {
			const editor = await vscode.window.showTextDocument(docB);
			await editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(38, 5, 40, 5), 'abc');
			});

			assert.strictEqual(history.locations.length, 3);
			assert.strictEqual(history.locations[0].position.line, 15);
			assert.strictEqual(history.locations[0].position.character, 1);
			assert.strictEqual(history.locations[1].position.line, 37);
			assert.strictEqual(history.locations[1].position.character, 29);
			assert.strictEqual(history.locations[2].position.line, 1);
			assert.strictEqual(history.locations[2].position.character, 16);
		});
	});
});

suite('Location', () => {
	test('equals', () => {
		const uriA = vscode.Uri.parse('file:///tmp/fileA');
		const uriB = vscode.Uri.parse('file:///tmp/fileB');

		const loc1 = new Location(uriA, new vscode.Position(26, 53), vscode.ViewColumn.One);
		const loc2 = new Location(uriA, new vscode.Position(26, 53), vscode.ViewColumn.One);
		const loc3 = new Location(uriB, new vscode.Position(26, 53), vscode.ViewColumn.One);
		const loc4 = new Location(uriA, new vscode.Position(27, 53), vscode.ViewColumn.One);
		const loc5 = new Location(uriA, new vscode.Position(26, 54), vscode.ViewColumn.One);
		const loc6 = new Location(uriA, new vscode.Position(26, 53), vscode.ViewColumn.Two);

		assert.strictEqual(loc1.equals(loc2), true);
		assert.strictEqual(loc1.equals(loc3), false);
		assert.strictEqual(loc1.equals(loc4), false);
		assert.strictEqual(loc1.equals(loc5), false);
		assert.strictEqual(loc1.equals(loc6), false);
	});
});
