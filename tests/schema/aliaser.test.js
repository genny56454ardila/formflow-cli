const { aliasField, unaliasField, listAliases, aliasSchema, unaliasSchema, listSchemaAliases } = require('../../src/schema/aliaser');

const baseField = { name: 'email', type: 'text' };
const baseSchema = {
  title: 'Test',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text', aliases: ['mobile'] }
  ]
};

describe('aliasField', () => {
  it('adds an alias to a field', () => {
    const result = aliasField(baseField, 'e-mail');
    expect(result.aliases).toContain('e-mail');
  });

  it('does not duplicate aliases', () => {
    const f = aliasField(baseField, 'e-mail');
    const f2 = aliasField(f, 'e-mail');
    expect(f2.aliases.filter(a => a === 'e-mail').length).toBe(1);
  });

  it('throws on invalid alias', () => {
    expect(() => aliasField(baseField, '')).toThrow();
    expect(() => aliasField(baseField, 123)).toThrow();
  });
});

describe('unaliasField', () => {
  it('removes an alias', () => {
    const f = aliasField(baseField, 'e-mail');
    const result = unaliasField(f, 'e-mail');
    expect(result.aliases).toBeUndefined();
  });

  it('returns field unchanged if no aliases', () => {
    const result = unaliasField(baseField, 'e-mail');
    expect(result).toEqual(baseField);
  });
});

describe('listAliases', () => {
  it('returns aliases array', () => {
    const f = aliasField(baseField, 'e-mail');
    expect(listAliases(f)).toEqual(['e-mail']);
  });

  it('returns empty array when no aliases', () => {
    expect(listAliases(baseField)).toEqual([]);
  });
});

describe('aliasSchema / unaliasSchema', () => {
  it('adds alias to named field in schema', () => {
    const result = aliasSchema(baseSchema, 'email', 'e-mail');
    const field = result.fields.find(f => f.name === 'email');
    expect(field.aliases).toContain('e-mail');
  });

  it('removes alias from named field in schema', () => {
    const s = aliasSchema(baseSchema, 'email', 'e-mail');
    const result = unaliasSchema(s, 'email', 'e-mail');
    const field = result.fields.find(f => f.name === 'email');
    expect(field.aliases).toBeUndefined();
  });
});

describe('listSchemaAliases', () => {
  it('returns map of field names to aliases', () => {
    const result = listSchemaAliases(baseSchema);
    expect(result).toEqual({ phone: ['mobile'] });
  });

  it('returns empty object when no aliases', () => {
    const s = { title: 'X', fields: [{ name: 'a', type: 'text' }] };
    expect(listSchemaAliases(s)).toEqual({});
  });
});
