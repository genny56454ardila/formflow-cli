const { flattenField, flattenSchema, unflattenSchema } = require('../../src/schema/flattener');

describe('flattenField', () => {
  it('returns single field unchanged when no children', () => {
    const field = { name: 'email', type: 'text' };
    expect(flattenField(field)).toEqual([{ name: 'email', type: 'text' }]);
  });

  it('flattens nested fields with dot notation', () => {
    const field = {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'city', type: 'text' }
      ]
    };
    const result = flattenField(field);
    const names = result.map((f) => f.name);
    expect(names).toContain('address');
    expect(names).toContain('address.street');
    expect(names).toContain('address.city');
  });

  it('applies prefix correctly', () => {
    const field = { name: 'zip', type: 'text' };
    const result = flattenField(field, 'address');
    expect(result[0].name).toBe('address.zip');
  });
});

describe('flattenSchema', () => {
  it('throws on invalid schema', () => {
    expect(() => flattenSchema(null)).toThrow('Invalid schema');
    expect(() => flattenSchema({ fields: 'bad' })).toThrow('Invalid schema');
  });

  it('flattens all nested fields', () => {
    const schema = {
      name: 'test',
      fields: [
        { name: 'username', type: 'text' },
        {
          name: 'address',
          type: 'group',
          fields: [{ name: 'city', type: 'text' }]
        }
      ]
    };
    const result = flattenSchema(schema);
    const names = result.fields.map((f) => f.name);
    expect(names).toContain('username');
    expect(names).toContain('address');
    expect(names).toContain('address.city');
  });

  it('preserves schema metadata', () => {
    const schema = { name: 'myForm', version: '1.0', fields: [] };
    const result = flattenSchema(schema);
    expect(result.name).toBe('myForm');
    expect(result.version).toBe('1.0');
  });
});

describe('unflattenSchema', () => {
  it('throws on invalid schema', () => {
    expect(() => unflattenSchema({})).toThrow('Invalid schema');
  });

  it('rebuilds nested structure from flat fields', () => {
    const schema = {
      name: 'test',
      fields: [
        { name: 'username', type: 'text' },
        { name: 'address.city', type: 'text' }
      ]
    };
    const result = unflattenSchema(schema);
    const addressField = result.fields.find((f) => f.name === 'address');
    expect(addressField).toBeDefined();
    expect(addressField.fields[0].name).toBe('city');
  });
});
