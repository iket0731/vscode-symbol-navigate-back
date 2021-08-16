import * as assert from 'assert';
import * as vscode from 'vscode';
import { LocationHistory, Location } from '../locationHistory';

suite('LocationHistory', () => {
	let history: LocationHistory
	let loc1: Location;
	let loc2: Location;
	let loc3: Location;

	setup(() => {
		history = new LocationHistory();

		const uriA = vscode.Uri.parse('file:///tmp/fileA');
		const uriB = vscode.Uri.parse('file:///tmp/fileB');

		loc1 = new Location(uriA, 15, vscode.ViewColumn.One);
		loc2 = new Location(uriB, 38, vscode.ViewColumn.Two);
		loc3 = new Location(uriB, 1, vscode.ViewColumn.Two);
	});

	test('add', () => {
		history.add(loc1);
		assert.strictEqual(undefined, history.current);

		history.add(loc2);
		assert.strictEqual(undefined, history.current);
	});

	test('add - limit for the number of locations', () => {
		for (let i = 0; i < 150; i++) {
			const uri = vscode.Uri.parse('file:///tmp/fileA');
			const loc = new Location(uri, i, vscode.ViewColumn.One);
			history.add(loc);
		}

		assert.strictEqual(128, history.locations.length);
		assert.strictEqual(22, history.locations[0].offset);
		assert.strictEqual(23, history.locations[1].offset);
		assert.strictEqual(148, history.locations[126].offset);
		assert.strictEqual(149, history.locations[127].offset);
		assert.strictEqual(128, history.currentIndex);
	});

	test('goBack', () => {
		history.add(loc1);
		history.add(loc2);
		history.add(loc3);

		let ret = history.goBack();
		assert.strictEqual(true, ret);
		assert.strictEqual(loc3, history.current);

		ret = history.goBack();
		assert.strictEqual(true, ret);
		assert.strictEqual(loc2, history.current);

		ret = history.goBack();
		assert.strictEqual(true, ret);
		assert.strictEqual(loc1, history.current);

		ret = history.goBack();
		assert.strictEqual(false, ret);
		assert.strictEqual(loc1, history.current);
	});

	test('goForward', () => {
		history.add(loc1);
		history.add(loc2);
		history.add(loc3);
		history.goBack();
		history.goBack();
		history.goBack();

		let ret = history.goForward();
		assert.strictEqual(true, ret);
		assert.strictEqual(loc2, history.current);

		ret = history.goForward();
		assert.strictEqual(true, ret);
		assert.strictEqual(loc3, history.current);

		ret = history.goForward();
		assert.strictEqual(false, ret);
		assert.strictEqual(loc3, history.current);
	});

	test('combination of add, goBack and goForward - case 1', () => {
		history.add(loc1);
		history.add(loc2);
		history.goBack();

		history.add(loc3);
		assert.strictEqual(undefined, history.current);

		history.goBack();
		assert.strictEqual(loc3, history.current);

		history.goBack();
		assert.strictEqual(loc1, history.current);

		history.goForward();
		assert.strictEqual(loc3, history.current);

		history.goBack();
		assert.strictEqual(loc1, history.current);
	});

	test('combination of add, goBack and goForward - case 2', () => {
		history.add(loc1);
		history.add(loc2);
		history.goBack();
		history.goBack();

		history.add(loc3);
		assert.strictEqual(undefined, history.current);

		history.goBack();
		assert.strictEqual(loc3, history.current);

		let ret = history.goBack();
		assert.strictEqual(false, ret);
	});

	test('acceptDocumentChanges - case 1', () => {
		history.add(loc1);
		history.add(loc2);
		history.add(loc3);
		history.goBack();

		const uri = loc2.uri;
		const changes: vscode.TextDocumentContentChangeEvent[] = [
			{
				range: new vscode.Range(1, 1, 1, 1), // dummy value
				rangeOffset: 5,
				rangeLength: 10,
				text: 'abc'
			},
			{
				range: new vscode.Range(1, 1, 1, 1), // dummy value
				rangeOffset: 25,
				rangeLength: 10,
				text: 'abc'
			}
		];

		history.acceptDocumentChanges(uri, changes);

		assert.strictEqual(3, history.locations.length);
		assert.strictEqual(15, history.locations[0].offset);
		assert.strictEqual(24, history.locations[1].offset);
		assert.strictEqual(1, history.locations[2].offset);
		assert.strictEqual(2, history.currentIndex);
	});

	test('acceptDocumentChanges - case 2', () => {
		history.add(loc1);
		history.add(loc2);
		history.add(loc3);
		history.goBack();

		const uri = loc2.uri;
		const changes: vscode.TextDocumentContentChangeEvent[] = [
			{
				range: new vscode.Range(1, 1, 1, 1), // dummy value
				rangeOffset: 30,
				rangeLength: 10,
				text: 'abc'
			}
		];

		history.acceptDocumentChanges(uri, changes);

		assert.strictEqual(3, history.locations.length);
		assert.strictEqual(15, history.locations[0].offset);
		assert.strictEqual(33, history.locations[1].offset);
		assert.strictEqual(1, history.locations[2].offset);
		assert.strictEqual(2, history.currentIndex);
	});
});

suite('Location', () => {
	test('equals', () => {
		const uriA = vscode.Uri.parse('file:///tmp/fileA');
		const uriB = vscode.Uri.parse('file:///tmp/fileB');

		const loc1 = new Location(uriA, 26, vscode.ViewColumn.One);
		const loc2 = new Location(uriA, 26, vscode.ViewColumn.One);
		const loc3 = new Location(uriB, 26, vscode.ViewColumn.One);
		const loc4 = new Location(uriA, 27, vscode.ViewColumn.One);
		const loc5 = new Location(uriA, 26, vscode.ViewColumn.Two);

		assert.strictEqual(true, loc1.equals(loc2));
		assert.strictEqual(false, loc1.equals(loc3));
		assert.strictEqual(false, loc1.equals(loc4));
		assert.strictEqual(false, loc1.equals(loc5));
	});
});
