const { transformField, transformSchema } = require('../../src/schema/transformer');

describe('transformField', () => {
  it('throws if field is not an object', () => {
    expect(() => transformField(null)).toThrow('field must be a non-null object');
    expect(() => transformField('string')).toThrow('field must be a non-null object');
  });

  it('throws if field has no name', () => {
    expect(() => transformField({ type: 'text' })).toThrow('field must have a name');
  });

  it('returns a copy of the field with no options', () => {
    const field = { name: 'email', type: 'text', required: true };
    const result = transformField(field);
    expect(result).toEqual(field);
    expect(result).not.toBe(field);
  });

  it('normalizes field type when normalizeTypes is true', () => {
    const field = { name: 'age', type: 'number' };
    const result = transformField(field, { normalizeTypes: true });
    expect(result.type).toBe('integer');
  });

  it('does not normalize type when normalizeTypes is false', () => {
    const field = { name: 'age', type: 'number' };
    const result = transformField(field, { normalizeTypes: false });
    expect(result.type).toBe('number');
  });

  it('leaves unknown types unchanged during normalization', () => {
    const field = { name: 'score', type: 'range' };
    const result = transformField(field, { normalizeTypes: true });
    expect(result.type).toBe('range');
  });

  it('applies default required=false when applyDefaults is true', () => {
    const field = { name: 'username', type: 'text' };
    const result = transformField(field, { applyDefaults: true });
    expect(result.required).toBe(false);
  });

  it('does not override existing required value when applyDefaults is true', () => {
    const field = { name: 'username', type: 'text', required: true };
    const result = transformField(field, { applyDefaults: true });
    expect(result.required).toBe(true);
  });

  it('generates a label from camelCase name when applyDefaults is true', () => {
    const field = { name: 'firstName', type: 'text' };
    const result = transformField(field, { applyDefaults: true });
    expect(result.label).toBe('First Name');
  });

  it('does not override existing label when applyDefaults is true', () => {
    const field = { name: 'firstName', type: 'text', label: 'Given Name' };
    const result = transformField(field, { applyDefaults: true });
    expect(result.label).toBe('Given Name');
  });
});

describe('transformSchema', () => {
  it('throws if schema has no fields array', () => {
    expect(() => transformSchema({})).toThrow('schema must have a fields array');
    expect(() => transformSchema(null)).toThrow('schema must have a fields array');
  });

  it('returns a new schema with transformed fields', () => {
    const schema = {
      name: 'signup',
      fields: [
        { name: 'email', type: 'text' },
        { name: 'age', type: 'number' },
      ],
    };
    const result = transformSchema(schema, { normalizeTypes: true });
    expect(result.fields[0].type).toBe('string');
    expect(result.fields[1].type).toBe('integer');
    expect(result.name).toBe('signup');
  });

  it('does not mutate the original schema', () => {
    const schema = {
      name: 'test',
      fields: [{ name: 'active', type: 'checkbox' }],
    };
    transformSchema(schema, { normalizeTypes: true });
    expect(schema.fields[0].type).toBe('checkbox');
  });

  it('applies defaults to all fields', () => {
    const schema = {
      name: 'profile',
      fields: [
        { name: 'firstName' },
        { name: 'lastName' },
      ],
    };
    const result = transformSchema(schema, { applyDefaults: true });
    result.fields.forEach((f) => {
      expect(f.required).toBe(false);
      expect(typeof f.label).toBe('string');
    });
  });
});
