const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot, loadSnapshot, listSnapshots } = require('../../src/schema/snapshotter');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'formflow-snap-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const sampleSchema = { name: 'login', fields: [{ id: 'email', type: 'email', required: true }] };

describe('saveSnapshot', () => {
  test('writes a JSON file and returns its path', () => {
    const filePath = saveSnapshot(sampleSchema, 'my snapshot', tmpDir);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(filePath.endsWith('.json')).toBe(true);
  });

  test('file contains label, savedAt, and schema', () => {
    const filePath = saveSnapshot(sampleSchema, 'v1', tmpDir);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(content.label).toBe('v1');
    expect(content.savedAt).toBeDefined();
    expect(content.schema).toEqual(sampleSchema);
  });

  test('creates snapshot directory if it does not exist', () => {
    const nestedDir = path.join(tmpDir, 'deep', 'snapshots');
    saveSnapshot(sampleSchema, 'test', nestedDir);
    expect(fs.existsSync(nestedDir)).toBe(true);
  });

  test('throws on invalid schema', () => {
    expect(() => saveSnapshot(null, 'label', tmpDir)).toThrow('Invalid schema');
  });

  test('throws on empty label', () => {
    expect(() => saveSnapshot(sampleSchema, '  ', tmpDir)).toThrow('Invalid label');
  });
});

describe('loadSnapshot', () => {
  test('loads a previously saved snapshot', () => {
    const filePath = saveSnapshot(sampleSchema, 'load-test', tmpDir);
    const snap = loadSnapshot(filePath);
    expect(snap.schema).toEqual(sampleSchema);
    expect(snap.label).toBe('load-test');
  });

  test('throws if file does not exist', () => {
    expect(() => loadSnapshot(path.join(tmpDir, 'ghost.json'))).toThrow('not found');
  });

  test('throws on invalid snapshot format', () => {
    const bad = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(bad, JSON.stringify({ foo: 'bar' }), 'utf8');
    expect(() => loadSnapshot(bad)).toThrow('Invalid snapshot format');
  });
});

describe('listSnapshots', () => {
  test('returns empty array when directory does not exist', () => {
    expect(listSnapshots(path.join(tmpDir, 'nonexistent'))).toEqual([]);
  });

  test('returns snapshot file paths sorted newest first', () => {
    saveSnapshot(sampleSchema, 'first', tmpDir);
    saveSnapshot(sampleSchema, 'second', tmpDir);
    const list = listSnapshots(tmpDir);
    expect(list.length).toBe(2);
    list.forEach((p) => expect(p.endsWith('.json')).toBe(true));
  });
});
