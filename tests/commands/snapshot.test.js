const path = require('path');
const fs = require('fs');
const os = require('os');

jest.mock('../../../src/schema/loader');
jest.mock('../../../src/schema/differ');
jest.mock('../../../src/commands/diff');

const { loadSchema } = require('../../../src/schema/loader');
const { diffSchemas } = require('../../../src/schema/differ');
const { printDiff } = require('../../../src/commands/diff');
const { runSnapshot, resolveInputPath } = require('../../../src/commands/snapshot');

let tmpDir;
const sampleSchema = { name: 'test', fields: [{ id: 'name', type: 'text', required: true }] };

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'formflow-snap-cmd-'));
  loadSchema.mockResolvedValue(sampleSchema);
  diffSchemas.mockReturnValue([]);
  printDiff.mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

describe('resolveInputPath', () => {
  test('resolves relative path', () => {
    const result = resolveInputPath('schema.json');
    expect(path.isAbsolute(result)).toBe(true);
  });

  test('throws when no input provided', () => {
    expect(() => resolveInputPath()).toThrow('Input path is required');
  });
});

describe('runSnapshot - save', () => {
  test('saves snapshot and logs path', async () => {
    const result = await runSnapshot('save', { input: 'schema.json', label: 'v1', dir: tmpDir });
    expect(typeof result).toBe('string');
    expect(fs.existsSync(result)).toBe(true);
  });

  test('uses filename as label when label not provided', async () => {
    const result = await runSnapshot('save', { input: 'my-form.json', dir: tmpDir });
    expect(path.basename(result)).toContain('my-form');
  });
});

describe('runSnapshot - list', () => {
  test('returns empty array when no snapshots', async () => {
    const result = await runSnapshot('list', { dir: tmpDir });
    expect(result).toEqual([]);
  });

  test('returns list after saving', async () => {
    await runSnapshot('save', { input: 'schema.json', label: 'snap1', dir: tmpDir });
    const result = await runSnapshot('list', { dir: tmpDir });
    expect(result.length).toBe(1);
  });
});

describe('runSnapshot - compare', () => {
  test('compares current schema to latest snapshot', async () => {
    await runSnapshot('save', { input: 'schema.json', label: 'base', dir: tmpDir });
    const diffs = await runSnapshot('compare', { input: 'schema.json', dir: tmpDir });
    expect(Array.isArray(diffs)).toBe(true);
    expect(diffSchemas).toHaveBeenCalled();
  });

  test('throws when no snapshots available', async () => {
    await expect(runSnapshot('compare', { input: 'schema.json', dir: tmpDir })).rejects.toThrow('No snapshots available');
  });
});

describe('runSnapshot - unknown action', () => {
  test('throws on unknown action', async () => {
    await expect(runSnapshot('explode', {})).rejects.toThrow('Unknown snapshot action');
  });
});
