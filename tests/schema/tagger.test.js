const { tagField, untagField, getFieldsByTag, tagSchema, listAllTags } = require('../../src/schema/tagger');

const baseSchema = {
  name: 'TestForm',
  fields: [
    { name: 'email', type: 'email', tags: ['required'] },
    { name: 'age', type: 'number', tags: [] },
    { name: 'bio', type: 'textarea' }
  ]
};

test('tagField adds a tag to a field', () => {
  const result = tagField(baseSchema, 'age', 'optional');
  const field = result.fields.find(f => f.name === 'age');
  expect(field.tags).toContain('optional');
});

test('tagField does not duplicate tags', () => {
  const result = tagField(baseSchema, 'email', 'required');
  const field = result.fields.find(f => f.name === 'email');
  expect(field.tags.filter(t => t === 'required').length).toBe(1);
});

test('tagField creates tags array if missing', () => {
  const result = tagField(baseSchema, 'bio', 'pii');
  const field = result.fields.find(f => f.name === 'bio');
  expect(field.tags).toContain('pii');
});

test('untagField removes a tag from a field', () => {
  const result = untagField(baseSchema, 'email', 'required');
  const field = result.fields.find(f => f.name === 'email');
  expect(field.tags).not.toContain('required');
});

test('untagField is safe when tag does not exist', () => {
  const result = untagField(baseSchema, 'age', 'nonexistent');
  const field = result.fields.find(f => f.name === 'age');
  expect(field.tags).toEqual([]);
});

test('getFieldsByTag returns correct fields', () => {
  const fields = getFieldsByTag(baseSchema, 'required');
  expect(fields.map(f => f.name)).toContain('email');
  expect(fields.length).toBe(1);
});

test('getFieldsByTag returns empty array when no match', () => {
  const fields = getFieldsByTag(baseSchema, 'unknown');
  expect(fields).toEqual([]);
});

test('listAllTags returns unique tags across all fields', () => {
  const tags = listAllTags(baseSchema);
  expect(tags).toContain('required');
  expect(new Set(tags).size).toBe(tags.length);
});

test('tagSchema does not mutate original', () => {
  const original = JSON.stringify(baseSchema);
  tagField(baseSchema, 'age', 'new-tag');
  expect(JSON.stringify(baseSchema)).toBe(original);
});
