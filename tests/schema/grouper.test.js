const { groupFields, groupSchema, formatGroups } = require('../../src/schema/grouper');

const sampleFields = [
  { name: 'email', type: 'text' },
  { name: 'age', type: 'number' },
  { name: 'username', type: 'text' },
  { name: 'subscribe', type: 'checkbox' },
];

describe('groupFields', () => {
  it('groups fields by type', () => {
    const result = groupFields(sampleFields, 'type');
    expect(result.text).toHaveLength(2);
    expect(result.number).toHaveLength(1);
    expect(result.checkbox).toHaveLength(1);
  });

  it('uses __ungrouped for missing key', () => {
    const fields = [{ name: 'x' }];
    const result = groupFields(fields, 'type');
    expect(result.__ungrouped).toHaveLength(1);
  });

  it('throws if fields is not an array', () => {
    expect(() => groupFields(null)).toThrow('fields must be an array');
  });
});

describe('groupSchema', () => {
  it('returns schema with groups property', () => {
    const schema = { name: 'test', fields: sampleFields };
    const result = groupSchema(schema, 'type');
    expect(result.groups).toBeDefined();
    expect(result.groups.text).toHaveLength(2);
  });

  it('preserves original schema properties', () => {
    const schema = { name: 'myForm', fields: sampleFields };
    const result = groupSchema(schema);
    expect(result.name).toBe('myForm');
    expect(result.fields).toEqual(sampleFields);
  });

  it('throws on invalid schema', () => {
    expect(() => groupSchema({})).toThrow('Invalid schema');
    expect(() => groupSchema(null)).toThrow('Invalid schema');
  });
});

describe('formatGroups', () => {
  it('formats grouped fields into readable string', () => {
    const grouped = groupFields(sampleFields, 'type');
    const output = formatGroups(grouped);
    expect(output).toContain('[text]');
    expect(output).toContain('- email');
    expect(output).toContain('[number]');
  });
});
