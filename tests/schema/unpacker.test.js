const { unpackFields, repackFields, unpackSchema } = require('../../src/schema/unpacker');
const { loadSchema } = require('../../src/schema/loader');

jest.mock('../../src/schema/loader');

describe('unpackFields', () => {
  it('returns a map keyed by field name', () => {
    const schema = {
      fields: [
        { name: 'email', type: 'text' },
        { name: 'age', type: 'number' },
      ],
    };
    const result = unpackFields(schema);
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('age');
    expect(result.email).toEqual({ name: 'email', type: 'text' });
  });

  it('throws if schema has no fields array', () => {
    expect(() => unpackFields({})).toThrow('Invalid schema');
    expect(() => unpackFields(null)).toThrow('Invalid schema');
  });

  it('throws if a field is missing a name', () => {
    const schema = { fields: [{ type: 'text' }] };
    expect(() => unpackFields(schema)).toThrow('Field missing required name property');
  });

  it('does not mutate original fields', () => {
    const field = { name: 'x', type: 'text' };
    const schema = { fields: [field] };
    const result = unpackFields(schema);
    result.x.type = 'number';
    expect(field.type).toBe('text');
  });
});

describe('repackFields', () => {
  it('reconstructs a schema from a field map', () => {
    const fieldMap = {
      email: { name: 'email', type: 'text' },
      age: { name: 'age', type: 'number' },
    };
    const result = repackFields(fieldMap, { title: 'My Form' });
    expect(result.title).toBe('My Form');
    expect(result.fields).toHaveLength(2);
  });

  it('throws on invalid field map', () => {
    expect(() => repackFields(null)).toThrow('Invalid field map');
  });
});

describe('unpackSchema', () => {
  it('loads and unpacks a schema from a file', () => {
    loadSchema.mockReturnValue({
      title: 'Test',
      fields: [{ name: 'username', type: 'text' }],
    });
    const { fieldMap, meta } = unpackSchema('some/path.json');
    expect(fieldMap).toHaveProperty('username');
    expect(meta).toEqual({ title: 'Test' });
    expect(meta).not.toHaveProperty('fields');
  });
});
