const { searchFields, searchSchema } = require('../../src/schema/searcher');
const { loadSchema } = require('../../src/schema/loader');

jest.mock('../../src/schema/loader');

const sampleSchema = {
  name: 'Test Form',
  fields: [
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'age', label: 'Your Age', type: 'number' },
    { name: 'newsletter', label: 'Subscribe to Newsletter', type: 'checkbox' },
  ],
};

describe('searchFields', () => {
  it('finds fields by name substring', () => {
    const results = searchFields(sampleSchema, 'user');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('username');
  });

  it('finds fields by label substring (case-insensitive by default)', () => {
    const results = searchFields(sampleSchema, 'newsletter');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('newsletter');
  });

  it('finds fields by type', () => {
    const results = searchFields(sampleSchema, 'text');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('username');
  });

  it('returns multiple matches', () => {
    const results = searchFields(sampleSchema, 'e');
    expect(results.length).toBeGreaterThan(1);
  });

  it('respects caseSensitive option', () => {
    const results = searchFields(sampleSchema, 'Email', { caseSensitive: true });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('email');
  });

  it('respects caseSensitive option — no match on wrong case', () => {
    const results = searchFields(sampleSchema, 'email', { caseSensitive: true, searchIn: ['label'] });
    expect(results).toHaveLength(0);
  });

  it('limits search to specified keys', () => {
    const results = searchFields(sampleSchema, 'email', { searchIn: ['type'] });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('email');
  });

  it('returns empty array when no match', () => {
    const results = searchFields(sampleSchema, 'zzznomatch');
    expect(results).toHaveLength(0);
  });

  it('throws on invalid schema', () => {
    expect(() => searchFields({}, 'email')).toThrow('Invalid schema');
  });

  it('throws on empty query', () => {
    expect(() => searchFields(sampleSchema, '  ')).toThrow('Query must be a non-empty string');
  });
});

describe('searchSchema', () => {
  beforeEach(() => {
    loadSchema.mockResolvedValue(sampleSchema);
  });

  it('loads schema and returns results', async () => {
    const { schema, results } = await searchSchema('form.json', 'age');
    expect(schema).toBe(sampleSchema);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('age');
  });

  it('passes options through', async () => {
    const { results } = await searchSchema('form.json', 'number', { searchIn: ['type'] });
    expect(results).toHaveLength(1);
  });
});
