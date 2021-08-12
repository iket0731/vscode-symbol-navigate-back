import * as assert from 'assert';
import * as vscode from 'vscode';
import { LocationHistory, Location } from '../locationHistory';

suite('LocationHistory', () => {
	let history: LocationHistory
	let loc1: Location;
	let loc2: Location;
	let loc3: Location;

	setup(async () => {
		history = new LocationHistory();

		const docA = await vscode.workspace.openTextDocument({ content: 'document A' });
		const docB = await vscode.workspace.openTextDocument({ content: 'document B' });

		loc1 = new Location(docA, new vscode.Position(15, 26), vscode.ViewColumn.One);
		loc2 = new Location(docB, new vscode.Position(38, 1), vscode.ViewColumn.Two);
		loc3 = new Location(docB, new vscode.Position(1, 27), vscode.ViewColumn.Two);
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
