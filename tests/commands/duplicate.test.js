const fs = require('fs');
const path = require('path');
const { resolveInputPath, runDuplicate } = require('../../src/commands/duplicate');
const { duplicateSchemaField } = require('../../src/schema/duplicator');
const { serializeSchema } = require('../../src/schema/generator');

jest.mock('../../src/schema/duplicator');
jest.mock('../../src/schema/generator');
jest.mock('fs');

describe('resolveInputPath', () => {
  it('throws when no path provided', () => {
    expect(() => resolveInputPath('')).toThrow('Input path is required');
  });

  it('throws when file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => resolveInputPath('/fake/path.json')).toThrow('File not found');
  });

  it('returns resolved path when file exists', () => {
    fs.existsSync.mockReturnValue(true);
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve('schema.json'));
  });
});

describe('runDuplicate', () => {
  const fakeSchema = {
    title: 'My Form',
    fields: [
      { name: 'email', type: 'email' },
      { name: 'email_copy', type: 'email' },
    ],
  };

  beforeEach(() => {
    fs.existsSync.mockReturnValue(true);
    duplicateSchemaField.mockResolvedValue(fakeSchema);
    serializeSchema.mockReturnValue(JSON.stringify(fakeSchema, null, 2));
    fs.writeFileSync.mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when fieldName is missing', async () => {
    await expect(runDuplicate('schema.json', '', 'copy')).rejects.toThrow('Field name is required');
  });

  it('throws when newName is missing', async () => {
    await expect(runDuplicate('schema.json', 'email', '')).rejects.toThrow(
      'New field name is required'
    );
  });

  it('prints serialized schema to stdout when no output option', async () => {
    await runDuplicate('schema.json', 'email', 'email_copy');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('email'));
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('writes to output file when --output is provided', async () => {
    await runDuplicate('schema.json', 'email', 'email_copy', { output: 'out.json' });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('out.json'),
      expect.any(String),
      'utf8'
    );
  });

  it('overwrites input file when --inPlace is set', async () => {
    await runDuplicate('schema.json', 'email', 'email_copy', { inPlace: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('schema.json'),
      expect.any(String),
      'utf8'
    );
  });

  it('returns the updated schema', async () => {
    const result = await runDuplicate('schema.json', 'email', 'email_copy');
    expect(result).toEqual(fakeSchema);
  });
});
