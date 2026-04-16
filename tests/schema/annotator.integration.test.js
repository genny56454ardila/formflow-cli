const { annotateField, removeAnnotation, annotateSchema, removeSchemaAnnotation, listAnnotations } = require('../../src/schema/annotator');

describe('annotator integration', () => {
  it('round-trips annotate then remove', () => {
    const field = { name: 'username', type: 'text' };
    const annotated = annotateField(annotateField(field, 'hint', 'your name'), 'tooltip', 'tip');
    expect(Object.keys(annotated.annotations)).toHaveLength(2);
    const cleaned = removeAnnotation(removeAnnotation(annotated, 'hint'), 'tooltip');
    expect(cleaned.annotations).toEqual({});
  });

  it('annotates multiple fields independently on schema', () => {
    let schema = { fields: [{ name: 'a', type: 'text' }, { name: 'b', type: 'text' }] };
    schema = annotateSchema(schema, 'a', 'note', 'field a note');
    schema = annotateSchema(schema, 'b', 'note', 'field b note');
    expect(listAnnotations(schema.fields[0])).toEqual({ note: 'field a note' });
    expect(listAnnotations(schema.fields[1])).toEqual({ note: 'field b note' });
  });

  it('removing non-existent annotation is a no-op', () => {
    const schema = { fields: [{ name: 'x', type: 'text', annotations: { keep: 'yes' } }] };
    const result = removeSchemaAnnotation(schema, 'x', 'ghost');
    expect(result.fields[0].annotations).toEqual({ keep: 'yes' });
  });

  it('does not mutate original schema', () => {
    const schema = { fields: [{ name: 'x', type: 'text' }] };
    annotateSchema(schema, 'x', 'k', 'v');
    expect(schema.fields[0].annotations).toBeUndefined();
  });
});
