const { tagField, untagField, getFieldsByTag, tagSchema, listAllTags } = require('../../src/schema/tagger');

describe('tagField', () => {
  it('adds a tag to a field with no existing tags', () => {
    const field = { name: 'email', type: 'text' };
    const result = tagField(field, 'pii');
    expect(result.tags).toEqual(['pii']);
  });

  it('does not duplicate existing tags', () => {
    const field = { name: 'email', type: 'text', tags: ['pii'] };
    const result = tagField(field, 'pii');
    expect(result.tags).toEqual(['pii']);
  });

  it('preserves other field properties', () => {
    const field = { name: 'email', type: 'text', required: true };
    const result = tagField(field, 'pii');
    expect(result.name).toBe('email');
    expect(result.required).toBe(true);
  });
});

describe('untagField', () => {
  it('removes a tag from a field', () => {
    const field = { name: 'email', tags: ['pii', 'sensitive'] };
    const result = untagField(field, 'pii');
    expect(result.tags).toEqual(['sensitive']);
  });

  it('returns empty tags if last tag removed', () => {
    const field = { name: 'email', tags: ['pii'] };
    const result = untagField(field, 'pii');
    expect(result.tags).toEqual([]);
  });

  it('handles field with no tags gracefully', () => {
    const field = { name: 'email' };
    const result = untagField(field, 'pii');
    expect(result.tags).toEqual([]);
  });
});

describe('getFieldsByTag', () => {
  const fields = [
    { name: 'email', tags: ['pii'] },
    { name: 'age', tags: ['optional'] },
    { name: 'ssn', tags: ['pii', 'sensitive'] },
  ];

  it('returns fields matching the tag', () => {
    const result = getFieldsByTag(fields, 'pii');
    expect(result.map(f => f.name)).toEqual(['email', 'ssn']);
  });

  it('returns empty array if no matches', () => {
    expect(getFieldsByTag(fields, 'nonexistent')).toEqual([]);
  });
});

describe('tagSchema', () => {
  const schema = {
    name: 'test',
    fields: [
      { name: 'email', type: 'text' },
      { name: 'age', type: 'number' },
    ],
  };

  it('adds a tag to a field by name', () => {
    const result = tagSchema(schema, 'email', 'pii', 'add');
    expect(result.fields.find(f => f.name === 'email').tags).toContain('pii');
  });

  it('removes a tag from a field by name', () => {
    const s = { ...schema, fields: [{ name: 'email', type: 'text', tags: ['pii'] }, { name: 'age', type: 'number' }] };
    const result = tagSchema(s, 'email', 'pii', 'remove');
    expect(result.fields.find(f => f.name === 'email').tags).not.toContain('pii');
  });

  it('throws on invalid schema', () => {
    expect(() => tagSchema(null, 'email', 'pii')).toThrow('Invalid schema');
  });
});

describe('listAllTags', () => {
  it('returns sorted unique tags across all fields', () => {
    const schema = {
      fields: [
        { name: 'a', tags: ['pii', 'required'] },
        { name: 'b', tags: ['optional', 'pii'] },
      ],
    };
    expect(listAllTags(schema)).toEqual(['optional', 'pii', 'required']);
  });

  it('returns empty array for schema with no tagged fields', () => {
    expect(listAllTags({ fields: [{ name: 'x' }] })).toEqual([]);
  });
});
