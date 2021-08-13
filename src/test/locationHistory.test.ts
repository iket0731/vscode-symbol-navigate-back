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

		loc1 = new Location(uriA, new vscode.Position(15, 26), vscode.ViewColumn.One);
		loc2 = new Location(uriB, new vscode.Position(38, 1), vscode.ViewColumn.Two);
		loc3 = new Location(uriB, new vscode.Position(1, 27), vscode.ViewColumn.Two);
	});

	test('add', () => {
		history.add(loc1);
		assert.strictEqual(undefined, history.current);

		history.add(loc2);
		assert.strictEqual(undefined, history.current);
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

	test('combination case 1', () => {
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

	test('combination case 2', () => {
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
});

suite('Location', () => {
	test('equals', () => {
		const uriA = vscode.Uri.parse('file:///tmp/fileA');
		const uriB = vscode.Uri.parse('file:///tmp/fileB');

		const loc1 = new Location(uriA, new vscode.Position(15, 26), vscode.ViewColumn.One);
		const loc2 = new Location(uriA, new vscode.Position(15, 26), vscode.ViewColumn.One);
		const loc3 = new Location(uriB, new vscode.Position(15, 26), vscode.ViewColumn.One);
		const loc4 = new Location(uriA, new vscode.Position(15, 27), vscode.ViewColumn.One);
		const loc5 = new Location(uriA, new vscode.Position(15, 26), vscode.ViewColumn.Two);

		assert.strictEqual(true, loc1.equals(loc2));
		assert.strictEqual(false, loc1.equals(loc3));
		assert.strictEqual(false, loc1.equals(loc4));
		assert.strictEqual(false, loc1.equals(loc5));
	});
});
