import * as assert from 'assert';
import * as vscode from 'vscode';
import { LocationHistory, Location } from '../locationHistory';

suite('LocationHistory', () => {
	let docA: vscode.TextDocument;
	let docB: vscode.TextDocument;
	let loc1: Location;
	let loc2: Location;
	let loc3: Location;

	setup(async () => {
		docA = await vscode.workspace.openTextDocument({ content: 'document A' });
		docB = await vscode.workspace.openTextDocument({ content: 'document B' });
		loc1 = new Location(docA, new vscode.Position(15, 26), vscode.ViewColumn.One);
		loc2 = new Location(docB, new vscode.Position(38, 1), vscode.ViewColumn.Two);
		loc3 = new Location(docB, new vscode.Position(1, 27), vscode.ViewColumn.Two);
	});

	test('save', () => {
		const history = new LocationHistory();

		history.save(loc1);
		assert.strictEqual(undefined, history.current);

		history.save(loc2);
		assert.strictEqual(undefined, history.current);
	});

	test('undo', () => {
		const history = new LocationHistory();
		history.save(loc1);
		history.save(loc2);
		history.save(loc3);

		history.undo();
		assert.strictEqual(loc3, history.current);

		history.undo();
		assert.strictEqual(loc2, history.current);

		history.undo();
		assert.strictEqual(loc1, history.current);

		history.undo();
		assert.strictEqual(loc1, history.current);
	});

	test('redo', () => {
		const history = new LocationHistory();
		history.save(loc1);
		history.save(loc2);
		history.save(loc3);
		history.undo();
		history.undo();
		history.undo();
		assert.strictEqual(loc1, history.current);

		history.redo();
		assert.strictEqual(loc2, history.current);

		history.redo();
		assert.strictEqual(loc3, history.current);

		history.redo();
		assert.strictEqual(loc3, history.current);
	});

	test('combination of methods', () => {
		const history = new LocationHistory();
		history.save(loc1);
		history.save(loc2);
		history.undo();
		assert.strictEqual(loc2, history.current);

		history.save(loc3);
		assert.strictEqual(undefined, history.current);

		history.undo();
		assert.strictEqual(loc3, history.current);

		history.undo();
		assert.strictEqual(loc1, history.current);

		history.save(loc3);
		assert.strictEqual(undefined, history.current);

		history.undo();
		assert.strictEqual(loc3, history.current);

		history.undo();
		assert.strictEqual(loc3, history.current);
	});
});