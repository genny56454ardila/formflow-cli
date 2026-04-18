const { reorderFields, reorderSchema } = require('../../src/schema/reorder');

describe('reorderFields', () => {
  const fields = [
    { name: 'email', type: 'email' },
    { name: 'username', type: 'text' },
    { name: 'age', type: 'number' },
  ];

  it('reorders fields by given order', () => {
    const result = reorderFields(fields, ['age', 'username', 'email']);
    expect(result.map(f => f.name)).toEqual(['age', 'username', 'email']);
  });

  it('appends fields not in order at the end', () => {
    const result = reorderFields(fields, ['email']);
    expect(result[0].name).toBe('email');
    expect(result.length).toBe(3);
  });

  it('ignores order entries that do not match any field', () => {
    const result = reorderFields(fields, ['nonexistent', 'age']);
    expect(result[0].name).toBe('age');
    expect(result.length).toBe(3);
  });

  it('returns all fields when order is empty', () => {
    const result = reorderFields(fields, []);
    expect(result.length).toBe(3);
  });

  it('throws if fields is not an array', () => {
    expect(() => reorderFields(null, [])).toThrow('fields must be an array');
  });

  it('throws if order is not an array', () => {
    expect(() => reorderFields(fields, null)).toThrow('order must be an array');
  });
});

describe('reorderSchema', () => {
  const schema = {
    name: 'TestForm',
    fields: [
      { name: 'b', type: 'text' },
      { name: 'a', type: 'text' },
      { name: 'c', type: 'text' },
    ],
  };

  it('reorders schema fields', () => {
    const result = reorderSchema(schema, ['a', 'b', 'c']);
    expect(result.fields.map(f => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('preserves other schema properties', () => {
    const result = reorderSchema(schema, ['c']);
    expect(result.name).toBe('TestForm');
  });

  it('throws on invalid schema', () => {
    expect(() => reorderSchema(null, [])).toThrow('Invalid schema');
    expect(() => reorderSchema({}, [])).toThrow('Schema must have a fields array');
  });
});
