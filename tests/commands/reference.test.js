const fs = require('fs');
const path = require('path');
const { resolveInputPath, runReference } = require('../../src/commands/reference');

jest.mock('../../src/schema/loader');
jest.mock('fs');

const { loadSchema } = require('../../src/schema/loader');

const mockSchema = {
  name: 'TestForm',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' }
  ]
};

beforeEach(() => {
  loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(mockSchema)));
  fs.writeFileSync.mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('resolveInputPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/absolute/path/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative paths against cwd', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runReference - add', () => {
  it('adds a reference to a field and writes schema', async () => {
    const result = await runReference(['schema.json'], {
      action: 'add',
      field: 'email',
      ref: 'RFC5322',
      description: 'Email format'
    });
    const emailField = result.fields.find(f => f.name === 'email');
    expect(emailField.refs).toHaveLength(1);
    expect(emailField.refs[0].id).toBe('RFC5322');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('throws if --field is missing', async () => {
    await expect(runReference(['schema.json'], { action: 'add', ref: 'RFC5322' }))
      .rejects.toThrow('--field is required');
  });

  it('throws if --ref is missing', async () => {
    await expect(runReference(['schema.json'], { action: 'add', field: 'email' }))
      .rejects.toThrow('--ref is required');
  });
});

describe('runReference - remove', () => {
  it('removes a reference from a field', async () => {
    loadSchema.mockResolvedValueOnce({
      name: 'TestForm',
      fields: [
        { name: 'email', type: 'text', refs: [{ id: 'RFC5322', description: '' }] }
      ]
    });
    const result = await runReference(['schema.json'], {
      action: 'remove',
      field: 'email',
      ref: 'RFC5322'
    });
    const emailField = result.fields.find(f => f.name === 'email');
    expect(emailField.refs).toHaveLength(0);
  });
});

describe('runReference - list', () => {
  it('lists all references in the schema', async () => {
    loadSchema.mockResolvedValueOnce({
      name: 'TestForm',
      fields: [
        { name: 'email', type: 'text', refs: [{ id: 'RFC5322', description: '' }] },
        { name: 'phone', type: 'text', refs: [{ id: 'E164', description: '' }] }
      ]
    });
    const refs = await runReference(['schema.json'], { action: 'list' });
    expect(refs).toContain('RFC5322');
    expect(refs).toContain('E164');
  });

  it('logs message when no references found', async () => {
    const refs = await runReference(['schema.json'], { action: 'list' });
    expect(refs).toEqual([]);
    expect(console.log).toHaveBeenCalledWith('No references found in schema.');
  });
});

describe('runReference - unknown action', () => {
  it('throws for unknown action', async () => {
    await expect(runReference(['schema.json'], { action: 'fly', field: 'email', ref: 'X' }))
      .rejects.toThrow('Unknown action: fly');
  });
});
