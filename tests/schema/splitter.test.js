const { splitFields, splitSchema, splitSchemaByGroup } = require('../../src/schema/splitter');

const sampleFields = [
  { name: 'email', type: 'email', required: true, group: 'contact' },
  { name: 'age', type: 'number', required: false, group: 'personal' },
  { name: 'phone', type: 'text', required: false, group: 'contact' },
  { name: 'bio', type: 'textarea', required: false },
];

const sampleSchema = { title: 'Test', fields: sampleFields };

describe('splitFields', () => {
  it('splits fields by predicate', () => {
    const { matched, rest } = splitFields(sampleFields, f => f.required);
    expect(matched).toHaveLength(1);
    expect(matched[0].name).toBe('email');
    expect(rest).toHaveLength(3);
  });

  it('returns empty matched when nothing matches', () => {
    const { matched, rest } = splitFields(sampleFields, () => false);
    expect(matched).toHaveLength(0);
    expect(rest).toHaveLength(4);
  });

  it('returns all matched when all match', () => {
    const { matched, rest } = splitFields(sampleFields, () => true);
    expect(matched).toHaveLength(4);
    expect(rest).toHaveLength(0);
  });
});

describe('splitSchema', () => {
  it('returns two schemas', () => {
    const [a, b] = splitSchema(sampleSchema, f => f.type === 'email');
    expect(a.fields).toHaveLength(1);
    expect(b.fields).toHaveLength(3);
    expect(a.title).toBe('Test');
  });

  it('handles schema with no fields', () => {
    const [a, b] = splitSchema({ title: 'Empty' }, () => true);
    expect(a.fields).toHaveLength(0);
    expect(b.fields).toHaveLength(0);
  });
});

describe('splitSchemaByGroup', () => {
  it('groups fields by group key', () => {
    const result = splitSchemaByGroup(sampleSchema);
    expect(result['contact'].fields).toHaveLength(2);
    expect(result['personal'].fields).toHaveLength(1);
    expect(result['__ungrouped'].fields).toHaveLength(1);
  });

  it('preserves schema metadata per group', () => {
    const result = splitSchemaByGroup(sampleSchema);
    expect(result['contact'].title).toBe('Test');
  });

  it('returns empty object for schema with no fields', () => {
    const result = splitSchemaByGroup({ title: 'None' });
    expect(Object.keys(result)).toHaveLength(0);
  });
});
