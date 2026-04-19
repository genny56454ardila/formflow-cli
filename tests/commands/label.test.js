const fs = require('fs');
const path = require('path');
const { resolveInputPath, runLabel } = require('../../src/commands/label');

jest.mock('../../src/schema/loader');
const { loadSchema } = require('../../src/schema/loader');

const mockSchema = {
  title: 'Test Form',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'age', type: 'number' }
  ]
};

beforeEach(() => {
  loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(mockSchema)));
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('resolveInputPath', () => {
  it('resolves relative path', () => {
    const result = resolveInputPath('schema.json');
    expect(path.isAbsolute(result)).toBe(true);
    expect(result).toContain('schema.json');
  });
});

describe('runLabel', () => {
  it('labels a field and writes output', async () => {
    await runLabel({ input: 'schema.json', field: 'email', label: 'pii' });
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written.fields[0].labels).toContain('pii');
  });

  it('removes a label when --remove is set', async () => {
    loadSchema.mockResolvedValue({ title: 'F', fields: [{ name: 'email', labels: ['pii'] }] });
    await runLabel({ input: 'schema.json', field: 'email', label: 'pii', remove: true });
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written.fields[0].labels).toEqual([]);
  });

  it('lists labels without writing', async () => {
    loadSchema.mockResolvedValue({ fields: [{ name: 'x', labels: ['internal'] }] });
    await runLabel({ input: 'schema.json', list: true });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('internal'));
  });

  it('throws if --field is missing', async () => {
    await expect(runLabel({ input: 'schema.json', label: 'pii' })).rejects.toThrow('--field is required');
  });

  it('throws if --label is missing', async () => {
    await expect(runLabel({ input: 'schema.json', field: 'email' })).rejects.toThrow('--label is required');
  });

  it('writes to custom output path', async () => {
    await runLabel({ input: 'schema.json', field: 'email', label: 'pii', output: 'out.json' });
    const outArg = fs.writeFileSync.mock.calls[0][0];
    expect(outArg).toContain('out.json');
  });
});
