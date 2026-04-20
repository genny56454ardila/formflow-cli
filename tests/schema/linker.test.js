const {
  linkField,
  unlinkField,
  linkFieldInSchema,
  unlinkFieldInSchema,
  listLinks,
} = require('../../src/schema/linker');

const baseField = { name: 'city', type: 'text' };
const baseSchema = {
  name: 'address',
  fields: [
    { name: 'country', type: 'select' },
    { name: 'state', type: 'select' },
    { name: 'city', type: 'text' },
  ],
};

describe('linkField', () => {
  it('adds linkedTo array to a field', () => {
    const result = linkField(baseField, ['country']);
    expect(result.linkedTo).toEqual(['country']);
  });

  it('merges with existing linkedTo entries', () => {
    const field = { ...baseField, linkedTo: ['country'] };
    const result = linkField(field, ['state']);
    expect(result.linkedTo).toEqual(['country', 'state']);
  });

  it('deduplicates linked names', () => {
    const field = { ...baseField, linkedTo: ['country'] };
    const result = linkField(field, ['country']);
    expect(result.linkedTo).toEqual(['country']);
  });

  it('does not mutate original field', () => {
    linkField(baseField, ['country']);
    expect(baseField.linkedTo).toBeUndefined();
  });
});

describe('unlinkField', () => {
  it('removes a linked field name', () => {
    const field = { ...baseField, linkedTo: ['country', 'state'] };
    const result = unlinkField(field, 'country');
    expect(result.linkedTo).toEqual(['state']);
  });

  it('returns empty array if no links remain', () => {
    const field = { ...baseField, linkedTo: ['country'] };
    const result = unlinkField(field, 'country');
    expect(result.linkedTo).toEqual([]);
  });

  it('is a no-op if target not linked', () => {
    const field = { ...baseField, linkedTo: ['state'] };
    const result = unlinkField(field, 'country');
    expect(result.linkedTo).toEqual(['state']);
  });
});

describe('linkFieldInSchema', () => {
  it('links a field within the schema', () => {
    const result = linkFieldInSchema(baseSchema, 'city', ['country', 'state']);
    const city = result.fields.find((f) => f.name === 'city');
    expect(city.linkedTo).toEqual(['country', 'state']);
  });

  it('does not affect other fields', () => {
    const result = linkFieldInSchema(baseSchema, 'city', ['country']);
    const country = result.fields.find((f) => f.name === 'country');
    expect(country.linkedTo).toBeUndefined();
  });
});

describe('unlinkFieldInSchema', () => {
  it('removes a link from a field in schema', () => {
    const linked = linkFieldInSchema(baseSchema, 'city', ['country', 'state']);
    const result = unlinkFieldInSchema(linked, 'city', 'country');
    const city = result.fields.find((f) => f.name === 'city');
    expect(city.linkedTo).toEqual(['state']);
  });
});

describe('listLinks', () => {
  it('returns all fields with links', () => {
    const linked = linkFieldInSchema(baseSchema, 'city', ['country']);
    const links = listLinks(linked);
    expect(links).toEqual([{ field: 'city', linkedTo: ['country'] }]);
  });

  it('returns empty array when no links exist', () => {
    expect(listLinks(baseSchema)).toEqual([]);
  });
});
