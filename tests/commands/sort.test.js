const path = require('path');
const fs = require('fs');
const { resolveInputPath, runSort } = require('../../src/commands/sort');

jest.mock('../../src/schema/loader');
jest.mock('../../src/schema/sorter');
jest.mock('../../src/schema/formatter');
const { loadSchema } = require('../../src/schema/loader');
const { sortSchema } = require('../../src/schema/sorter');
const { formatSchema } = require('../../src/schema/formatter');

const mockSchema = {
  name: 'TestForm',
  fields: [
    { name: 'zip', type: 'text', required: false, label: 'Zip' },
    { name: 'email', type: 'email', required: true, label: 'Email' },
  ],
};

describe('resolveInputPath', () => {
  test('throws if no input provided', () => {
    expect(() => resolveInputPath(undefined)).toThrow('No input file specified.');
  });

  test('throws if file does not exist', () => {
    expect(() => resolveInputPath('nonexistent.json')).toThrow('File not found');
  });

  test('returns resolved path for existing file', () => {
    const tmp = path.join(__dirname, '_sort_tmp.json');
    fs.writeFileSync(tmp, '{}');
    const result = resolveInputPath(tmp);
    expect(result).toBe(path.resolve(tmp));
    fs.unlinkSync(tmp);
  });
});

describe('runSort', () => {
  let consoleSpy;
  let exitSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    loadSchema.mockReturnValue(mockSchema);
    sortSchema.mockReturnValue(mockSchema);
    formatSchema.mockReturnValue('formatted output');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('exits with error on invalid sort key', async () => {
    await expect(runSort({ input: 'x.json', key: 'bad', order: 'asc' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('exits with error on invalid order', async () => {
    await expect(runSort({ input: 'x.json', key: 'name', order: 'sideways' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('exits if file not found', async () => {
    await expect(runSort({ input: 'missing.json', key: 'name', order: 'asc' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('prints formatted schema to stdout when no output specified', async () => {
    const tmp = path.join(__dirname, '_sort_run_tmp.json');
    fs.writeFileSync(tmp, JSON.stringify(mockSchema));
    await runSort({ input: tmp, key: 'name', order: 'asc' });
    expect(consoleSpy).toHaveBeenCalledWith('formatted output');
    fs.unlinkSync(tmp);
  });

  test('writes sorted schema to output file when output specified', async () => {
    const tmp = path.join(__dirname, '_sort_in_tmp.json');
    const out = path.join(__dirname, '_sort_out_tmp.json');
    fs.writeFileSync(tmp, JSON.stringify(mockSchema));
    await runSort({ input: tmp, key: 'name', order: 'asc', output: out });
    expect(fs.existsSync(out)).toBe(true);
    fs.unlinkSync(tmp);
    fs.unlinkSync(out);
  });
});
