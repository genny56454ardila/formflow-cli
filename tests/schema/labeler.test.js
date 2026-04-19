const { labelField, unlabelField, listLabels, labelSchema, unlabelSchema, listSchemaLabels } = require('../../src/schema/labeler');

describe('labelField', () => {
  it('adds a label to a field', () => {
    const f = { name: 'email', type: 'text' };
    expect(labelField(f, 'pii').labels).toEqual(['pii']);
  });
  it('does not duplicate labels', () => {
    const f = { name: 'email', type: 'text', labels: ['pii'] };
    expect(labelField(f, 'pii').labels).toEqual(['pii']);
  });
  it('throws on invalid field', () => {
    expect(() => labelField(null, 'pii')).toThrow('Invalid field');
  });
  it('throws on invalid label', () => {
    expect(() => labelField({ name: 'x' }, '')).toThrow('Invalid label');
  });
});

describe('unlabelField', () => {
  it('removes a label', () => {
    const f = { name: 'email', labels: ['pii', 'required'] };
    expect(unlabelField(f, 'pii').labels).toEqual(['required']);
  });
  it('handles missing labels gracefully', () => {
    const f = { name: 'email' };
    expect(unlabelField(f, 'pii').labels).toBeUndefined();
  });
});

describe('listLabels', () => {
  it('returns labels array', () => {
    expect(listLabels({ name: 'x', labels: ['a', 'b'] })).toEqual(['a', 'b']);
  });
  it('returns empty array if no labels', () => {
    expect(listLabels({ name: 'x' })).toEqual([]);
  });
});

describe('labelSchema / unlabelSchema', () => {
  const schema = { title: 'Form', fields: [
    { name: 'email', type: 'text' },
    { name: 'age', type: 'number' }
  ]};

  it('labels a specific field', () => {
    const result = labelSchema(schema, 'email', 'pii');
    expect(result.fields[0].labels).toContain('pii');
    expect(result.fields[1].labels).toBeUndefined();
  });

  it('unlabels a specific field', () => {
    const s = labelSchema(schema, 'email', 'pii');
    const result = unlabelSchema(s, 'email', 'pii');
    expect(result.fields[0].labels).toEqual([]);
  });

  it('throws on invalid schema', () => {
    expect(() => labelSchema(null, 'email', 'pii')).toThrow('Invalid schema');
  });
});

describe('listSchemaLabels', () => {
  it('returns all unique labels across fields', () => {
    const schema = { fields: [
      { name: 'a', labels: ['pii', 'required'] },
      { name: 'b', labels: ['required', 'internal'] }
    ]};
    const labels = listSchemaLabels(schema);
    expect(labels.sort()).toEqual(['internal', 'pii', 'required']);
  });
  it('returns empty array for schema with no labels', () => {
    expect(listSchemaLabels({ fields: [{ name: 'x' }] })).toEqual([]);
  });
});
