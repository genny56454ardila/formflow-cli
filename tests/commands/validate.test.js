const path = require('path');
const { resolveInputPath, runValidate } = require('../../src/commands/validate');
const { loadSchema } = require('../../src/schema/loader');
const { validateSchema } = require('../../src/schema/validator');

jest.mock('../../src/schema/loader');
jest.mock('../../src/schema/validator');

const VALID_SCHEMA = {
  id: 'contact-form',
  fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: false }
  ]
};

describe('resolveInputPath', () => {
  it('throws when no argument provided', () => {
    expect(() => resolveInputPath(undefined)).toThrow('No input file specified');
  });

  it('returns absolute path unchanged', () => {
    const abs = '/tmp/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative path against cwd', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runValidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns valid:true for a valid schema', async () => {
    loadSchema.mockResolvedValue(VALID_SCHEMA);
    validateSchema.mockReturnValue({ valid: true, errors: [] });

    const result = await runValidate('schema.json', { quiet: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid:false with errors for invalid schema', async () => {
    loadSchema.mockResolvedValue({});
    validateSchema.mockReturnValue({ valid: false, errors: ['Missing id', 'Missing fields'] });

    const result = await runValidate('bad.json', { quiet: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing id');
  });

  it('throws when loadSchema fails', async () => {
    loadSchema.mockRejectedValue(new Error('File not found'));
    await expect(runValidate('missing.json', { quiet: true })).rejects.toThrow('Failed to load schema');
  });

  it('throws when no input arg given', async () => {
    await expect(runValidate(undefined, { quiet: true })).rejects.toThrow('No input file specified');
  });
});
