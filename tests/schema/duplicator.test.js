const { duplicateField, duplicateFieldInSchema } = require('../../src/schema/duplicator');

describe('duplicateField', () => {
  it('returns a new field object with the given name', () => {
    const field = { name: 'email', type: 'email', required: true };
    const result = duplicateField(field, 'email_copy');
    expect(result).toEqual({ name: 'email_copy', type: 'email', required: true });
  });

  it('does not mutate the original field', () => {
    const field = { name: 'age', type: 'number' };
    duplicateField(field, 'age_backup');
    expect(field.name).toBe('age');
  });

  it('trims whitespace from newName', () => {
    const field = { name: 'username', type: 'text' };
    const result = duplicateField(field, '  username_copy  ');
    expect(result.name).toBe('username_copy');
  });

  it('throws on invalid field', () => {
    expect(() => duplicateField(null, 'copy')).toThrow('Invalid field');
    expect(() => duplicateField('bad', 'copy')).toThrow('Invalid field');
  });

  it('throws on invalid newName', () => {
    const field = { name: 'x', type: 'text' };
    expect(() => duplicateField(field, '')).toThrow('Invalid newName');
    expect(() => duplicateField(field, '   ')).toThrow('Invalid newName');
    expect(() => duplicateField(field, 42)).toThrow('Invalid newName');
  });
});

describe('duplicateFieldInSchema', () => {
  const schema = {
    title: 'Test Form',
    fields: [
      { name: 'first_name', type: 'text' },
      { name: 'email', type: 'email', required: true },
      { name: 'age', type: 'number' },
    ],
  };

  it('inserts duplicate immediately after the original field', () => {
    const result = duplicateFieldInSchema(schema, 'email', 'email_copy');
    expect(result.fields[2].name).toBe('email_copy');
    expect(result.fields[2].type).toBe('email');
    expect(result.fields.length).toBe(4);
  });

  it('preserves other fields and schema metadata', () => {
    const result = duplicateFieldInSchema(schema, 'first_name', 'first_name_2');
    expect(result.title).toBe('Test Form');
    expect(result.fields[0].name).toBe('first_name');
    expect(result.fields[1].name).toBe('first_name_2');
    expect(result.fields[2].name).toBe('email');
  });

  it('does not mutate the original schema', () => {
    duplicateFieldInSchema(schema, 'age', 'age_copy');
    expect(schema.fields.length).toBe(3);
  });

  it('throws when field not found', () => {
    expect(() => duplicateFieldInSchema(schema, 'nonexistent', 'copy')).toThrow(
      'Field "nonexistent" not found'
    );
  });

  it('throws when newName already exists', () => {
    expect(() => duplicateFieldInSchema(schema, 'email', 'age')).toThrow(
      'Field "age" already exists'
    );
  });

  it('throws on invalid schema', () => {
    expect(() => duplicateFieldInSchema(null, 'email', 'copy')).toThrow('Invalid schema');
    expect(() => duplicateFieldInSchema({ fields: 'bad' }, 'email', 'copy')).toThrow(
      'Invalid schema'
    );
  });
});
