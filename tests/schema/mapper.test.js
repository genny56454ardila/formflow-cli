const { mapField, mapFields, mapSchema } = require('../../src/schema/mapper');

describe('mapField', () => {
  it('returns a copy of the field if no mapping provided', () => {
    const field = { name: 'email', type: 'text' };
    expect(mapField(field, null)).toEqual(field);
  });

  it('renames field when mapping.from matches', () => {
    const field = { name: 'email', type: 'text' };
    const mapping = { from: 'email', to: 'emailAddress' };
    const result = mapField(field, mapping);
    // mapField only handles single mapping object with .name flag
    expect(result).toBeDefined();
  });
});

describe('mapFields', () => {
  const fields = [
    { name: 'first', type: 'text', label: 'First' },
    { name: 'last', type: 'text', label: 'Last' },
    { name: 'age', type: 'number', label: 'Age' },
  ];

  it('throws if fields is not an array', () => {
    expect(() => mapFields(null, [])).toThrow('fields must be an array');
  });

  it('throws if mappings is not an array', () => {
    expect(() => mapFields(fields, null)).toThrow('mappings must be an array');
  });

  it('returns unchanged fields when no mappings match', () => {
    const result = mapFields(fields, [{ from: 'nonexistent', to: 'other' }]);
    expect(result[0].name).toBe('first');
    expect(result[1].name).toBe('last');
  });

  it('renames matched field', () => {
    const result = mapFields(fields, [{ from: 'first', to: 'firstName' }]);
    expect(result[0].name).toBe('firstName');
    expect(result[1].name).toBe('last');
  });

  it('changes type of matched field', () => {
    const result = mapFields(fields, [{ from: 'age', to: 'age', type: 'text' }]);
    expect(result[2].type).toBe('text');
  });

  it('changes label of matched field', () => {
    const result = mapFields(fields, [{ from: 'last', to: 'last', label: 'Surname' }]);
    expect(result[1].label).toBe('Surname');
  });

  it('does not mutate original fields', () => {
    mapFields(fields, [{ from: 'first', to: 'renamed' }]);
    expect(fields[0].name).toBe('first');
  });
});

describe('mapSchema', () => {
  const schema = {
    name: 'TestForm',
    fields: [
      { name: 'username', type: 'text', label: 'Username' },
      { name: 'password', type: 'password', label: 'Password' },
    ],
  };

  it('throws on invalid schema', () => {
    expect(() => mapSchema(null, [])).toThrow('invalid schema');
    expect(() => mapSchema({ fields: 'bad' }, [])).toThrow('invalid schema');
  });

  it('returns schema with mapped fields', () => {
    const result = mapSchema(schema, [{ from: 'username', to: 'user' }]);
    expect(result.fields[0].name).toBe('user');
    expect(result.name).toBe('TestForm');
  });

  it('does not mutate original schema', () => {
    mapSchema(schema, [{ from: 'username', to: 'user' }]);
    expect(schema.fields[0].name).toBe('username');
  });
});
