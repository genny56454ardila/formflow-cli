const fs = require('fs');
const path = require('path');
const os = require('os');
const { archiveSchema, listArchives, loadArchive } = require('../../src/schema/archiver');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archiver-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const sampleSchema = {
  title: 'Test Form',
  fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'number' },
  ],
};

describe('archiveSchema', () => {
  test('creates archive file in the given directory', () => {
    const filepath = archiveSchema(sampleSchema, tmpDir);
    expect(fs.existsSync(filepath)).toBe(true);
  });

  test('archive file contains schema and metadata', () => {
    const filepath = archiveSchema(sampleSchema, tmpDir, 'my label');
    const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    expect(raw.schema).toEqual(sampleSchema);
    expect(raw.label).toBe('my label');
    expect(raw.archivedAt).toBeDefined();
  });

  test('creates archive dir if it does not exist', () => {
    const nested = path.join(tmpDir, 'deep', 'archives');
    archiveSchema(sampleSchema, nested);
    expect(fs.existsSync(nested)).toBe(true);
  });

  test('throws on invalid schema', () => {
    expect(() => archiveSchema({}, tmpDir)).toThrow('Invalid schema');
  });
});

describe('listArchives', () => {
  test('returns empty array when dir does not exist', () => {
    expect(listArchives(path.join(tmpDir, 'nonexistent'))).toEqual([]);
  });

  test('lists archives sorted by date descending', () => {
    archiveSchema(sampleSchema, tmpDir, 'first');
    archiveSchema(sampleSchema, tmpDir, 'second');
    const list = listArchives(tmpDir);
    expect(list.length).toBe(2);
    expect(list[0].label).toBe('second');
  });
});

describe('loadArchive', () => {
  test('loads schema from an archive file', () => {
    archiveSchema(sampleSchema, tmpDir);
    const [{ filename }] = listArchives(tmpDir);
    const schema = loadArchive(tmpDir, filename);
    expect(schema).toEqual(sampleSchema);
  });

  test('throws if archive file not found', () => {
    expect(() => loadArchive(tmpDir, 'missing.json')).toThrow('Archive not found');
  });
});
