const { generateSchema, serializeSchema } = require('../../src/schema/generator');

describe('generateSchema', () => {
  const validConfig = {
    formId: 'contact-form',
    title: 'Contact Us',
    description: 'A simple contact form',
    fields: [
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'message', type: 'textarea', label: 'Your Message' },
    ],
  };

  it('should generate a valid schema from a minimal config', () => {
    const schema = generateSchema(validConfig);
    expect(schema.formId).toBe('contact-form');
    expect(schema.title).toBe('Contact Us');
    expect(schema.fields).toHaveLength(2);
  });

  it('should set default values for optional field properties', () => {
    const config = {
      formId: 'simple-form',
      fields: [{ name: 'username' }],
    };
    const schema = generateSchema(config);
    const field = schema.fields[0];
    expect(field.type).toBe('text');
    expect(field.label).toBe('username');
    expect(field.required).toBe(false);
    expect(field.placeholder).toBe('');
    expect(field.validation).toEqual({});
  });

  it('should use formId as title when title is not provided', () => {
    const config = { formId: 'my-form', fields: [{ name: 'field1' }] };
    const schema = generateSchema(config);
    expect(schema.title).toBe('my-form');
  });

  it('should default version to 1.0.0', () => {
    const schema = generateSchema(validConfig);
    expect(schema.version).toBe('1.0.0');
  });

  it('should throw if config is null or not an object', () => {
    expect(() => generateSchema(null)).toThrow('Config must be a non-null object');
    expect(() => generateSchema('string')).toThrow('Config must be a non-null object');
  });

  it('should throw if formId is missing or invalid', () => {
    expect(() => generateSchema({ fields: [{ name: 'x' }] })).toThrow('valid string "formId"');
  });

  it('should throw if fields array is missing or empty', () => {
    expect(() => generateSchema({ formId: 'f' })).toThrow('non-empty "fields" array');
    expect(() => generateSchema({ formId: 'f', fields: [] })).toThrow('non-empty "fields" array');
  });

  it('should throw if a field is missing a name', () => {
    const config = { formId: 'f', fields: [{ type: 'text' }] };
    expect(() => generateSchema(config)).toThrow('Field at index 0 must have a valid "name" string');
  });
});

describe('serializeSchema', () => {
  it('should return a formatted JSON string', () => {
    const schema = { formId: 'test', fields: [] };
    const result = serializeSchema(schema);
    expect(typeof result).toBe('string');
    expect(result).toContain('"formId": "test"');
  });

  it('should produce valid parseable JSON', () => {
    const schema = { formId: 'test', fields: [{ name: 'x' }] };
    const result = serializeSchema(schema);
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
