const path = require('path');
const fs = require('fs/promises');
const { buildSchemaConfig, runScaffold } = require('../../src/commands/scaffold');
const { generateSchema, serializeSchema } = require('../../src/schema/generator');

jest.mock('fs/promises');
jest.mock('../../src/schema/generator');

describe('buildSchemaConfig', () => {
  it('returns config with empty fields when none provided', () => {
    const config = buildSchemaConfig('my-form');
    expect(config.id).toBe('my-form');
    expect(config.fields).toHaveLength(0);
  });

  it('parses field definitions correctly', () => {
    const config = buildSchemaConfig('reg-form', ['username:text', 'email:email', 'age']);
    expect(config.fields).toEqual([
      { name: 'username', type: 'text', required: false },
      { name: 'email', type: 'email', required: false },
      { name: 'age', type: 'text', required: false }
    ]);
  });
});

describe('runScaffold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generateSchema.mockReturnValue({ id: 'test', fields: [] });
    serializeSchema.mockReturnValue('{"id":"test","fields":[]}')
    fs.writeFile.mockResolvedValue();
  });

  it('throws when formId is missing', async () => {
    await expect(runScaffold(undefined, 'out.json', { quiet: true })).rejects.toThrow('Form ID is required');
  });

  it('writes schema to default path when no output given', async () => {
    fs.access.mockRejectedValue({ code: 'ENOENT' });
    const result = await runScaffold('my-form', undefined, { quiet: true });
    expect(result).toBe(path.resolve(process.cwd(), 'my-form.schema.json'));
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('writes schema to specified output path', async () => {
    fs.access.mockRejectedValue({ code: 'ENOENT' });
    const result = await runScaffold('my-form', 'custom.json', { quiet: true });
    expect(result).toBe(path.resolve(process.cwd(), 'custom.json'));
  });

  it('throws when file exists and overwrite is false', async () => {
    fs.access.mockResolvedValue();
    await expect(runScaffold('my-form', 'exists.json', { quiet: true })).rejects.toThrow('File already exists');
  });

  it('overwrites when overwrite option is true', async () => {
    const result = await runScaffold('my-form', 'exists.json', { quiet: true, overwrite: true });
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(result).toBeTruthy();
  });
});
