const { normalizeField, normalizeSchema } = require('../../src/schema/normalizer');

describe('normalizeField', () => {
  it('sets default type to text if missing', () => {
    const result = normalizeField({ name: 'age' });
    expect(result.type).toBe('text');
  });

  it('lowercases and trims type', () => {
    const result = normalizeField({ name: 'email', type: '  EMAIL  ' });
    expect(result.type).toBe('email');
  });

  it('falls back to text for unknown type', () => {
    const result = normalizeField({ name: 'x', type: 'fancy-input' });
    expect(result.type).toBe('text');
  });

  it('normalizes name to snake_case lowercase', () => {
    const result = normalizeField({ name: 'First Name', type: 'text' });
    expect(result.name).toBe('first_name');
  });

  it('generates label from name if missing', () => {
    const result = normalizeField({ name: 'last_name', type: 'text' });
    expect(result.label).toBe('Last Name');
  });

  it('keeps existing label trimmed', () => {
    const result = normalizeField({ name: 'x', type: 'text', label: '  My Label  ' });
    expect(result.label).toBe('My Label');
  });

  it('defaults required to false', () => {
    const result = normalizeField({ name: 'x', type: 'text' });
    expect(result.required).toBe(false);
  });

  it('coerces required to boolean', () => {
    const result = normalizeField({ name: 'x', type: 'text', required: 1 });
    expect(result.required).toBe(true);
  });

  it('normalizes string options for select', () => {
    const result = normalizeField({ name: 'color', type: 'select', options: ['Red', 'Blue'] });
    expect(result.options).toEqual([
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
    ]);
  });

  it('throws on invalid field', () => {
    expect(() => normalizeField(null)).toThrow('Invalid field');
  });
});

describe('normalizeSchema', () => {
  it('normalizes all fields in schema', () => {
    const schema = { title: 'Test', fields: [{ name: 'User Name', type: 'TEXT' }] };
    const result = normalizeSchema(schema);
    expect(result.fields[0].name).toBe('user_name');
    expect(result.fields[0].type).toBe('text');
  });

  it('preserves schema-level properties', () => {
    const schema = { title: 'My Form', fields: [] };
    const result = normalizeSchema(schema);
    expect(result.title).toBe('My Form');
  });

  it('throws if schema has no fields array', () => {
    expect(() => normalizeSchema({})).toThrow();
  });
});
