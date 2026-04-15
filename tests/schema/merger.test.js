const { mergeFields, mergeSchemas } = require('../../src/schema/merger');

describe('mergeFields', () => {
  const fieldsA = [
    { name: 'email', type: 'email', required: true },
    { name: 'username', type: 'text' },
  ];

  const fieldsB = [
    { name: 'username', type: 'text', maxLength: 50 },
    { name: 'age', type: 'number' },
  ];

  it('combines fields from multiple arrays', () => {
    const result = mergeFields(fieldsA, fieldsB);
    expect(result).toHaveLength(3);
  });

  it('later fields override earlier ones on duplicate names', () => {
    const result = mergeFields(fieldsA, fieldsB);
    const username = result.find((f) => f.name === 'username');
    expect(username.maxLength).toBe(50);
  });

  it('preserves fields unique to earlier arrays', () => {
    const result = mergeFields(fieldsA, fieldsB);
    expect(result.find((f) => f.name === 'email')).toBeDefined();
  });

  it('throws if a field is missing a name', () => {
    expect(() => mergeFields([{ type: 'text' }])).toThrow(
      'Each field must have a name property'
    );
  });

  it('throws if input is not an array', () => {
    expect(() => mergeFields(null)).toThrow(
      'Each schema must have a valid fields array'
    );
  });
});

describe('mergeSchemas', () => {
  const schemaA = {
    name: 'registration',
    description: 'Base form',
    version: '1.0',
    fields: [{ name: 'email', type: 'email', required: true }],
  };

  const schemaB = {
    name: 'registration-extended',
    description: 'Extended form',
    version: '1.1',
    fields: [
      { name: 'email', type: 'email', required: true, placeholder: 'you@example.com' },
      { name: 'phone', type: 'tel' },
    ],
  };

  it('returns a merged schema object', () => {
    const result = mergeSchemas(schemaA, schemaB);
    expect(result).toHaveProperty('name', 'registration');
    expect(result.fields).toHaveLength(2);
  });

  it('uses description and version from the last schema that defines them', () => {
    const result = mergeSchemas(schemaA, schemaB);
    expect(result.version).toBe('1.1');
    expect(result.description).toBe('Extended form');
  });

  it('throws when fewer than two schemas are provided', () => {
    expect(() => mergeSchemas(schemaA)).toThrow(
      'At least two schemas are required to merge'
    );
  });

  it('throws when a schema is missing required properties', () => {
    expect(() => mergeSchemas(schemaA, { name: 'bad' })).toThrow(
      'Each schema must have a name and fields array'
    );
  });

  it('throws when a non-object is passed', () => {
    expect(() => mergeSchemas(schemaA, null)).toThrow(
      'All arguments must be valid schema objects'
    );
  });
});
