const fs = require('fs');
const path = require('path');
const { resolveInputPath, runDeprecate } = require('../../src/commands/deprecate');

jest.mock('fs');
jest.mock('../../src/schema/loader');

const { loadSchema } = require('../../src/schema/loader');

const mockSchema = {
  name: 'test',
  fields: [
    { name: 'email', type: 'email' },
    { name: 'legacy_id', type: 'text' }
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(mockSchema)));
  fs.writeFileSync = jest.fn();
  console.log = jest.fn();
});

describe('resolveInputPath', () => {
  it('returns absolute path unchanged', () => {
    expect(resolveInputPath('/abs/path.json')).toBe('/abs/path.json');
  });

  it('resolves relative path', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runDeprecate', () => {
  it('throws if --input missing', async () => {
    await expect(runDeprecate({})).rejects.toThrow('--input is required');
  });

  it('throws if --fields missing and not listing', async () => {
    await expect(runDeprecate({ input: 'schema.json' })).rejects.toThrow('--fields is required');
  });

  it('deprecates fields and writes file', async () => {
    await runDeprecate({ input: 'schema.json', fields: 'legacy_id', reason: 'old field' });
    expect(fs.writeFileSync).toHaveBeenCalled();
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    const field = written.fields.find(f => f.name === 'legacy_id');
    expect(field.deprecated).toBe(true);
    expect(field.deprecationReason).toBe('old field');
  });

  it('undeprecates fields when --undo is set', async () => {
    loadSchema.mockResolvedValue({
      name: 'test',
      fields: [{ name: 'legacy_id', type: 'text', deprecated: true, deprecationReason: 'old' }]
    });
    await runDeprecate({ input: 'schema.json', fields: 'legacy_id', undo: true });
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    const field = written.fields.find(f => f.name === 'legacy_id');
    expect(field.deprecated).toBeUndefined();
  });

  it('lists deprecated fields without writing', async () => {
    loadSchema.mockResolvedValue({
      name: 'test',
      fields: [{ name: 'legacy_id', type: 'text', deprecated: true, deprecationReason: 'old' }]
    });
    await runDeprecate({ input: 'schema.json', list: true });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[DEPRECATED]'));
  });
});
