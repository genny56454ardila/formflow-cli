const { sortFields, sortSchema, VALID_SORT_KEYS, VALID_ORDERS } = require('../../src/schema/sorter');

const sampleFields = [
  { name: 'zip', type: 'text', required: false, label: 'Zip Code' },
  { name: 'email', type: 'email', required: true, label: 'Email Address' },
  { name: 'age', type: 'number', required: false, label: 'Age' },
  { name: 'name', type: 'text', required: true, label: 'Full Name' },
];

describe('sortFields', () => {
  test('sorts by name ascending by default', () => {
    const result = sortFields(sampleFields);
    expect(result.map(f => f.name)).toEqual(['age', 'email', 'name', 'zip']);
  });

  test('sorts by name descending', () => {
    const result = sortFields(sampleFields, 'name', 'desc');
    expect(result.map(f => f.name)).toEqual(['zip', 'name', 'email', 'age']);
  });

  test('sorts by type ascending', () => {
    const result = sortFields(sampleFields, 'type', 'asc');
    expect(result[0].type).toBe('email');
  });

  test('sorts by required ascending (false before true)', () => {
    const result = sortFields(sampleFields, 'required', 'asc');
    expect(result[0].required).toBe(false);
    expect(result[result.length - 1].required).toBe(true);
  });

  test('sorts by required descending (true before false)', () => {
    const result = sortFields(sampleFields, 'required', 'desc');
    expect(result[0].required).toBe(true);
  });

  test('sorts by label ascending', () => {
    const result = sortFields(sampleFields, 'label', 'asc');
    expect(result[0].label).toBe('Age');
  });

  test('does not mutate original array', () => {
    const original = [...sampleFields];
    sortFields(sampleFields, 'name', 'asc');
    expect(sampleFields).toEqual(original);
  });

  test('throws on invalid sort key', () => {
    expect(() => sortFields(sampleFields, 'invalid')).toThrow('Invalid sort key');
  });

  test('throws on invalid sort order', () => {
    expect(() => sortFields(sampleFields, 'name', 'random')).toThrow('Invalid sort order');
  });
});

describe('sortSchema', () => {
  const schema = { name: 'TestForm', fields: sampleFields };

  test('returns sorted schema with same metadata', () => {
    const result = sortSchema(schema, 'name', 'asc');
    expect(result.name).toBe('TestForm');
    expect(result.fields.map(f => f.name)).toEqual(['age', 'email', 'name', 'zip']);
  });

  test('does not mutate original schema', () => {
    const original = schema.fields.map(f => f.name);
    sortSchema(schema, 'name', 'desc');
    expect(schema.fields.map(f => f.name)).toEqual(original);
  });

  test('throws if schema is not an object', () => {
    expect(() => sortSchema(null)).toThrow('Invalid schema');
  });

  test('throws if schema has no fields array', () => {
    expect(() => sortSchema({ name: 'Bad' })).toThrow('"fields" array');
  });
});

describe('constants', () => {
  test('VALID_SORT_KEYS includes expected values', () => {
    expect(VALID_SORT_KEYS).toContain('name');
    expect(VALID_SORT_KEYS).toContain('type');
  });

  test('VALID_ORDERS contains asc and desc', () => {
    expect(VALID_ORDERS).toEqual(expect.arrayContaining(['asc', 'desc']));
  });
});
