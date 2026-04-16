const { tagField, untagField, tagSchema, untagSchema, listTags } = require('../../src/schema/tagger');

describe('tagField', () => {
  it('adds tags to a field', () => {
    const field = { name: 'email', type: 'text' };
    const result = tagField(field, ['pii', 'required']);
    expect(result.tags).toEqual(['pii', 'required']);
  });

  it('merges with existing tags without duplicates', () => {
    const field = { name: 'email', type: 'text', tags: ['pii'] };
    const result = tagField(field, ['pii', 'sensitive']);
    expect(result.tags).toEqual(['pii', 'sensitive']);
  });

  it('throws on invalid field', () => {
    expect(() => tagField(null, ['pii'])).toThrow('Invalid field');
  });
});

describe('untagField', () => {
  it('removes specified tags', () => {
    const field = { name: 'email', tags: ['pii', 'required'] };
    const result = untagField(field, ['pii']);
    expect(result.tags).toEqual(['required']);
  });

  it('handles missing tags gracefully', () => {
    const field = { name: 'email' };
    const result = untagField(field, ['pii']);
    expect(result.tags).toEqual([]);
  });
});

describe('tagSchema', () => {
  const schema = { title: 'Form', fields: [{ name: 'email', type: 'text' }, { name: 'age', type: 'number' }] };

  it('tags the correct field', () => {
    const result = tagSchema(schema, 'email', ['pii']);
    expect(result.fields.find(f => f.name === 'email').tags).toEqual(['pii']);
    expect(result.fields.find(f => f.name === 'age').tags).toBeUndefined();
  });

  it('throws on invalid schema', () => {
    expect(() => tagSchema(null, 'email', ['pii'])).toThrow('Invalid schema');
  });
});

describe('untagSchema', () => {
  const schema = { title: 'Form', fields: [{ name: 'email', type: 'text', tags: ['pii', 'required'] }] };

  it('removes tags from correct field', () => {
    const result = untagSchema(schema, 'email', ['pii']);
    expect(result.fields[0].tags).toEqual(['required']);
  });
});

describe('listTags', () => {
  it('returns sorted unique tags across all fields', () => {
    const schema = { fields: [
      { name: 'a', tags: ['pii', 'required'] },
      { name: 'b', tags: ['required', 'sensitive'] }
    ]};
    expect(listTags(schema)).toEqual(['pii', 'required', 'sensitive']);
  });

  it('returns empty array when no tags', () => {
    const schema = { fields: [{ name: 'a' }] };
    expect(listTags(schema)).toEqual([]);
  });
});
