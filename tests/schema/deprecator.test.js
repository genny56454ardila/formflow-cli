const {
  deprecateField,
  undeprecateField,
  deprecateSchema,
  undeprecateSchema,
  listDeprecated,
  formatDeprecated
} = require('../../src/schema/deprecator');

const baseSchema = {
  name: 'test',
  fields: [
    { name: 'email', type: 'email' },
    { name: 'username', type: 'text' },
    { name: 'legacy_id', type: 'text' }
  ]
};

describe('deprecateField', () => {
  it('marks a field as deprecated with a reason', () => {
    const result = deprecateField({ name: 'legacy_id', type: 'text' }, 'Use new_id instead');
    expect(result.deprecated).toBe(true);
    expect(result.deprecationReason).toBe('Use new_id instead');
  });

  it('uses default reason if none provided', () => {
    const result = deprecateField({ name: 'x', type: 'text' });
    expect(result.deprecationReason).toBe('No reason provided');
  });
});

describe('undeprecateField', () => {
  it('removes deprecated flags', () => {
    const deprecated = deprecateField({ name: 'x', type: 'text' }, 'old');
    const result = undeprecateField(deprecated);
    expect(result.deprecated).toBeUndefined();
    expect(result.deprecationReason).toBeUndefined();
    expect(result.name).toBe('x');
  });
});

describe('deprecateSchema', () => {
  it('deprecates specified fields', () => {
    const result = deprecateSchema(baseSchema, ['legacy_id'], 'Use new_id');
    const field = result.fields.find(f => f.name === 'legacy_id');
    expect(field.deprecated).toBe(true);
  });

  it('leaves other fields untouched', () => {
    const result = deprecateSchema(baseSchema, ['legacy_id']);
    const email = result.fields.find(f => f.name === 'email');
    expect(email.deprecated).toBeUndefined();
  });
});

describe('undeprecateSchema', () => {
  it('removes deprecation from specified fields', () => {
    const deprecated = deprecateSchema(baseSchema, ['legacy_id'], 'old');
    const result = undeprecateSchema(deprecated, ['legacy_id']);
    const field = result.fields.find(f => f.name === 'legacy_id');
    expect(field.deprecated).toBeUndefined();
  });
});

describe('listDeprecated', () => {
  it('returns only deprecated fields', () => {
    const schema = deprecateSchema(baseSchema, ['legacy_id', 'username']);
    const result = listDeprecated(schema);
    expect(result).toHaveLength(2);
    expect(result.map(f => f.name)).toContain('legacy_id');
  });

  it('returns empty array when none deprecated', () => {
    expect(listDeprecated(baseSchema)).toHaveLength(0);
  });
});

describe('formatDeprecated', () => {
  it('formats deprecated fields', () => {
    const fields = [{ name: 'legacy_id', deprecationReason: 'Use new_id' }];
    expect(formatDeprecated(fields)).toContain('[DEPRECATED] legacy_id');
  });

  it('returns message when no deprecated fields', () => {
    expect(formatDeprecated([])).toBe('No deprecated fields.');
  });
});
