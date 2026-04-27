const { embedField, embedSchema, listEmbedded, stripEmbeds } = require('../../src/schema/embedder');

describe('embedField', () => {
  it('embeds refSchema properties into a field', () => {
    const field = { name: 'country', $ref: '#/defs/country' };
    const refSchema = { type: 'select', label: 'Country', options: ['US', 'UK'] };
    const result = embedField(field, refSchema);
    expect(result.type).toBe('select');
    expect(result.label).toBe('Country');
    expect(result.embedded).toBe(true);
    expect(result.embeddedFrom).toBe('#/defs/country');
    expect(result.$ref).toBeUndefined();
  });

  it('works without a $ref on the field', () => {
    const field = { name: 'note' };
    const refSchema = { type: 'textarea' };
    const result = embedField(field, refSchema);
    expect(result.embedded).toBe(true);
    expect(result.embeddedFrom).toBeNull();
  });

  it('throws on invalid field', () => {
    expect(() => embedField(null, {})).toThrow('Invalid field');
  });

  it('throws on invalid refSchema', () => {
    expect(() => embedField({}, null)).toThrow('Invalid refSchema');
  });
});

describe('embedSchema', () => {
  const refMap = {
    '#/defs/email': { type: 'email', label: 'Email Address' },
    '#/defs/name': { type: 'text', label: 'Full Name' },
  };

  it('embeds all $ref fields using the refMap', () => {
    const schema = {
      name: 'signup',
      fields: [
        { name: 'email', $ref: '#/defs/email' },
        { name: 'username', type: 'text', label: 'Username' },
      ],
    };
    const result = embedSchema(schema, refMap);
    expect(result.fields[0].type).toBe('email');
    expect(result.fields[0].embedded).toBe(true);
    expect(result.fields[1].embedded).toBeUndefined();
  });

  it('throws when a $ref cannot be resolved', () => {
    const schema = { name: 'test', fields: [{ name: 'x', $ref: '#/defs/missing' }] };
    expect(() => embedSchema(schema, refMap)).toThrow('Unresolved $ref: #/defs/missing');
  });

  it('throws on invalid schema', () => {
    expect(() => embedSchema(null, {})).toThrow('Invalid schema');
  });

  it('throws on invalid refMap', () => {
    expect(() => embedSchema({ fields: [] }, null)).toThrow('Invalid refMap');
  });
});

describe('listEmbedded', () => {
  it('returns only embedded fields', () => {
    const schema = {
      fields: [
        { name: 'a', embedded: true, embeddedFrom: '#/defs/a' },
        { name: 'b', type: 'text' },
      ],
    };
    const result = listEmbedded(schema);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('a');
  });

  it('returns empty array when no embedded fields', () => {
    expect(listEmbedded({ fields: [{ name: 'x' }] })).toHaveLength(0);
  });
});

describe('stripEmbeds', () => {
  it('restores $ref and removes embedded metadata', () => {
    const schema = {
      fields: [
        { name: 'email', embedded: true, embeddedFrom: '#/defs/email', type: 'email', label: 'Email' },
        { name: 'user', type: 'text' },
      ],
    };
    const result = stripEmbeds(schema);
    expect(result.fields[0].$ref).toBe('#/defs/email');
    expect(result.fields[0].embedded).toBeUndefined();
    expect(result.fields[1].type).toBe('text');
  });
});
