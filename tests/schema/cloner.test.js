const { cloneField, cloneFieldInSchema, cloneSchema } = require('../../src/schema/cloner');

describe('cloneField', () => {
  const field = { name: 'email', type: 'text', required: true };

  it('clones a field with a new name', () => {
    const result = cloneField(field, 'email_backup');
    expect(result.name).toBe('email_backup');
    expect(result.type).toBe('text');
    expect(result.required).toBe(true);
  });

  it('generates a unique name if none provided', () => {
    const result = cloneField(field);
    expect(result.name).toMatch(/^email_copy_/);
  });

  it('does not mutate the original field', () => {
    cloneField(field, 'other');
    expect(field.name).toBe('email');
  });

  it('throws on invalid field', () => {
    expect(() => cloneField(null)).toThrow('Invalid field');
    expect(() => cloneField('bad')).toThrow('Invalid field');
  });
});

describe('cloneFieldInSchema', () => {
  const schema = {
    title: 'Test',
    fields: [
      { name: 'username', type: 'text' },
      { name: 'age', type: 'number' },
    ],
  };

  it('clones a field and appends it to schema', () => {
    const result = cloneFieldInSchema(schema, 'username', 'username_copy');
    expect(result.fields).toHaveLength(3);
    expect(result.fields[2].name).toBe('username_copy');
    expect(result.fields[2].type).toBe('text');
  });

  it('throws if source field not found', () => {
    expect(() => cloneFieldInSchema(schema, 'missing', 'x')).toThrow('not found');
  });

  it('throws if new name already exists', () => {
    expect(() => cloneFieldInSchema(schema, 'username', 'age')).toThrow('already exists');
  });

  it('throws on invalid schema', () => {
    expect(() => cloneFieldInSchema(null, 'username')).toThrow('Invalid schema');
  });
});

describe('cloneSchema', () => {
  const schema = { title: 'My Form', fields: [{ name: 'x', type: 'text' }] };

  it('clones schema with a new title', () => {
    const result = cloneSchema(schema, 'Copy Form');
    expect(result.title).toBe('Copy Form');
    expect(result.fields).toHaveLength(1);
  });

  it('generates a default clone title', () => {
    const result = cloneSchema(schema);
    expect(result.title).toBe('My Form_clone');
  });

  it('does not mutate the original schema', () => {
    const result = cloneSchema(schema, 'New');
    result.fields.push({ name: 'y', type: 'number' });
    expect(schema.fields).toHaveLength(1);
  });

  it('throws on invalid schema', () => {
    expect(() => cloneSchema(null)).toThrow('Invalid schema');
  });
});
