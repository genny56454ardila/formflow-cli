const { validateSchema } = require('../../src/schema/validator');

describe('validateSchema', () => {
  const validSchema = {
    formId: 'contact-form',
    title: 'Contact Us',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name' },
      { id: 'email', type: 'email', label: 'Email Address' },
      { id: 'role', type: 'select', label: 'Role', options: ['dev', 'design', 'other'] },
    ],
  };

  test('accepts a valid schema', () => {
    const result = validateSchema(validSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects null schema', () => {
    const result = validateSchema(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/non-null object/);
  });

  test('requires formId', () => {
    const result = validateSchema({ ...validSchema, formId: undefined });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('formId'))).toBe(true);
  });

  test('requires title', () => {
    const result = validateSchema({ ...validSchema, title: 42 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  test('rejects empty fields array', () => {
    const result = validateSchema({ ...validSchema, fields: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('fields'))).toBe(true);
  });

  test('rejects duplicate field ids', () => {
    const schema = {
      ...validSchema,
      fields: [
        { id: 'name', type: 'text', label: 'Name' },
        { id: 'name', type: 'email', label: 'Email' },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('duplicate'))).toBe(true);
  });

  test('requires options for select fields', () => {
    const schema = {
      ...validSchema,
      fields: [{ id: 'role', type: 'select', label: 'Role' }],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('options'))).toBe(true);
  });

  test('rejects unknown field type', () => {
    const schema = {
      ...validSchema,
      fields: [{ id: 'x', type: 'slider', label: 'X' }],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('type'))).toBe(true);
  });
});
