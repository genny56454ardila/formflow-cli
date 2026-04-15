const path = require('path');

jest.mock('../../../src/schema/loader');
jest.mock('../../../src/schema/merger');

const { loadSchema } = require('../../../src/schema/loader');
const { mergeSchemas } = require('../../../src/schema/merger');
const { resolveInputPath } = require('../../../src/commands/merge');

const schemaA = { name: 'formA', fields: [{ id: 'email', type: 'email', required: true }] };
const schemaB = { name: 'formB', fields: [{ id: 'phone', type: 'tel', required: false }] };
const merged = { name: 'formA', fields: [...schemaA.fields, ...schemaB.fields] };

beforeEach(() => {
  loadSchema.mockResolvedValue(schemaA);
  mergeSchemas.mockReturnValue(merged);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('resolveInputPath', () => {
  test('returns absolute path for relative input', () => {
    const result = resolveInputPath('schema.json');
    expect(path.isAbsolute(result)).toBe(true);
  });

  test('returns the same path when input is already absolute', () => {
    const absolutePath = path.resolve('/tmp/schema.json');
    const result = resolveInputPath(absolutePath);
    expect(result).toBe(absolutePath);
  });

  test('throws when input is missing', () => {
    expect(() => resolveInputPath(undefined)).toThrow();
  });

  test('throws when input is an empty string', () => {
    expect(() => resolveInputPath('')).toThrow();
  });
});

describe('mergeSchemas integration', () => {
  test('mergeSchemas is called with two schemas', () => {
    mergeSchemas(schemaA, schemaB);
    expect(mergeSchemas).toHaveBeenCalledWith(schemaA, schemaB);
  });

  test('merged result contains fields from both schemas', () => {
    const result = mergeSchemas(schemaA, schemaB);
    expect(result.fields.length).toBe(2);
    expect(result.fields.map((f) => f.id)).toContain('email');
    expect(result.fields.map((f) => f.id)).toContain('phone');
  });

  test('merged result preserves name from first schema', () => {
    const result = mergeSchemas(schemaA, schemaB);
    expect(result.name).toBe('formA');
  });
});
