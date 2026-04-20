const {
  linkField,
  unlinkField,
  linkFieldInSchema,
  unlinkFieldInSchema,
  listLinks,
} = require('../../src/schema/linker');

describe('linker integration', () => {
  const schema = {
    name: 'profile',
    fields: [
      { name: 'country', type: 'select' },
      { name: 'region', type: 'select' },
      { name: 'city', type: 'text' },
      { name: 'zip', type: 'text' },
    ],
  };

  it('builds a chain of links and lists them all', () => {
    let s = linkFieldInSchema(schema, 'region', ['country']);
    s = linkFieldInSchema(s, 'city', ['country', 'region']);
    s = linkFieldInSchema(s, 'zip', ['city']);

    const links = listLinks(s);
    expect(links).toHaveLength(3);
    expect(links.find((l) => l.field === 'region').linkedTo).toEqual(['country']);
    expect(links.find((l) => l.field === 'city').linkedTo).toEqual(['country', 'region']);
    expect(links.find((l) => l.field === 'zip').linkedTo).toEqual(['city']);
  });

  it('removing a link from a chain reduces it correctly', () => {
    let s = linkFieldInSchema(schema, 'city', ['country', 'region']);
    s = unlinkFieldInSchema(s, 'city', 'country');
    const links = listLinks(s);
    expect(links).toHaveLength(1);
    expect(links[0].linkedTo).toEqual(['region']);
  });

  it('unlinking all links removes field from listLinks output', () => {
    let s = linkFieldInSchema(schema, 'city', ['country']);
    s = unlinkFieldInSchema(s, 'city', 'country');
    expect(listLinks(s)).toEqual([]);
  });

  it('linkField is composable with unlinkField at field level', () => {
    let f = { name: 'city', type: 'text' };
    f = linkField(f, ['country', 'region']);
    f = unlinkField(f, 'region');
    expect(f.linkedTo).toEqual(['country']);
  });
});
