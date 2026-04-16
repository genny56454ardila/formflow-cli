const { annotateField, removeAnnotation, listAnnotations, annotateSchema, removeSchemaAnnotation } = require('../../src/schema/annotator');

describe('annotateField', () => {
  it('adds an annotation to a field', () => {
    const field = { name: 'email', type: 'text' };
    const result = annotateField(field, 'hint', 'Enter your email');
    expect(result.annotations).toEqual({ hint: 'Enter your email' });
  });

  it('merges with existing annotations', () => {
    const field = { name: 'email', type: 'text', annotations: { hint: 'old' } };
    const result = annotateField(field, 'tooltip', 'tip text');
    expect(result.annotations).toEqual({ hint: 'old', tooltip: 'tip text' });
  });

  it('throws on invalid field', () => {
    expect(() => annotateField(null, 'key', 'val')).toThrow('Invalid field');
  });

  it('throws on invalid key', () => {
    expect(() => annotateField({ name: 'x' }, '', 'val')).toThrow('Annotation key must be a string');
  });
});

describe('removeAnnotation', () => {
  it('removes an existing annotation', () => {
    const field = { name: 'x', annotations: { hint: 'hi', tooltip: 'tip' } };
    const result = removeAnnotation(field, 'hint');
    expect(result.annotations).toEqual({ tooltip: 'tip' });
  });

  it('returns field unchanged if no annotations', () => {
    const field = { name: 'x' };
    expect(removeAnnotation(field, 'hint')).toEqual(field);
  });
});

describe('listAnnotations', () => {
  it('returns annotations object', () => {
    const field = { name: 'x', annotations: { a: 1 } };
    expect(listAnnotations(field)).toEqual({ a: 1 });
  });

  it('returns empty object when none', () => {
    expect(listAnnotations({ name: 'x' })).toEqual({});
  });
});

describe('annotateSchema', () => {
  const schema = { fields: [{ name: 'email', type: 'text' }, { name: 'age', type: 'number' }] };

  it('annotates the correct field', () => {
    const result = annotateSchema(schema, 'email', 'hint', 'your email');
    expect(result.fields[0].annotations).toEqual({ hint: 'your email' });
    expect(result.fields[1].annotations).toBeUndefined();
  });

  it('throws on invalid schema', () => {
    expect(() => annotateSchema(null, 'email', 'k', 'v')).toThrow('Invalid schema');
  });
});

describe('removeSchemaAnnotation', () => {
  it('removes annotation from correct field', () => {
    const schema = { fields: [{ name: 'email', type: 'text', annotations: { hint: 'hi' } }] };
    const result = removeSchemaAnnotation(schema, 'email', 'hint');
    expect(result.fields[0].annotations).toEqual({});
  });
});
