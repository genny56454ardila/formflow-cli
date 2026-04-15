const { filterFields, filterSchema } = require('../../src/schema/filter');

describe('filterFields', () => {
  const fields = [
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'number', required: false },
    { name: 'username', type: 'text', required: true },
    { name: 'bio', type: 'text', required: false },
  ];

  it('returns all fields when no options given', () => {
    expect(filterFields(fields)).toHaveLength(4);
  });

  it('filters by type', () => {
    const result = filterFields(fields, { type: 'text' });
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.type === 'text')).toBe(true);
  });

  it('filters by required: true', () => {
    const result = filterFields(fields, { required: true });
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.required === true)).toBe(true);
  });

  it('filters by required: false', () => {
    const result = filterFields(fields, { required: false });
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.required === false)).toBe(true);
  });

  it('filters by custom predicate', () => {
    const result = filterFields(fields, { predicate: (f) => f.name.length > 3 });
    expect(result).toHaveLength(3);
  });

  it('combines type and required filters', () => {
    const result = filterFields(fields, { type: 'text', required: true });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('username');
  });

  it('throws if fields is not an array', () => {
    expect(() => filterFields(null)).toThrow('fields must be an array');
  });
});

describe('filterSchema', () => {
  const schema = {
    name: 'TestForm',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'count', type: 'number', required: false },
    ],
  };

  it('returns a new schema with filtered fields', () => {
    const result = filterSchema(schema, { type: 'text' });
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].name).toBe('title');
  });

  it('preserves other schema properties', () => {
    const result = filterSchema(schema, { required: true });
    expect(result.name).toBe('TestForm');
  });

  it('does not mutate original schema', () => {
    filterSchema(schema, { type: 'number' });
    expect(schema.fields).toHaveLength(2);
  });

  it('throws if schema is not an object', () => {
    expect(() => filterSchema(null)).toThrow('schema must be an object');
  });

  it('throws if schema.fields is not an array', () => {
    expect(() => filterSchema({ name: 'Bad' })).toThrow('schema.fields must be an array');
  });
});
