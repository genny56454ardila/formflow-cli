const { renameField, renameSchema } = require('../../src/schema/renamer');

describe('renameField', () => {
  const baseFields = [
    { name: 'email', type: 'email', required: true },
    { name: 'username', type: 'text', required: true },
    { name: 'age', type: 'number', required: false },
  ];

  it('renames an existing field', () => {
    const result = renameField(baseFields, 'email', 'emailAddress');
    expect(result.find((f) => f.name === 'emailAddress')).toBeDefined();
    expect(result.find((f) => f.name === 'email')).toBeUndefined();
  });

  it('preserves other field properties when renaming', () => {
    const result = renameField(baseFields, 'email', 'emailAddress');
    const renamed = result.find((f) => f.name === 'emailAddress');
    expect(renamed.type).toBe('email');
    expect(renamed.required).toBe(true);
  });

  it('does not mutate the original fields array', () => {
    renameField(baseFields, 'age', 'userAge');
    expect(baseFields.find((f) => f.name === 'age')).toBeDefined();
  });

  it('throws if fields is not an array', () => {
    expect(() => renameField(null, 'email', 'emailAddress')).toThrow('fields must be an array');
  });

  it('throws if oldName does not exist', () => {
    expect(() => renameField(baseFields, 'nonexistent', 'newName')).toThrow(
      'Field "nonexistent" not found in schema'
    );
  });

  it('throws if newName already exists', () => {
    expect(() => renameField(baseFields, 'email', 'username')).toThrow(
      'Field "username" already exists in schema'
    );
  });

  it('throws if oldName is empty', () => {
    expect(() => renameField(baseFields, '', 'newName')).toThrow('oldName must be a non-empty string');
  });

  it('throws if newName is empty', () => {
    expect(() => renameField(baseFields, 'email', '')).toThrow('newName must be a non-empty string');
  });
});

describe('renameSchema', () => {
  const baseSchema = {
    name: 'UserForm',
    fields: [
      { name: 'firstName', type: 'text', required: true },
      { name: 'lastName', type: 'text', required: true },
    ],
  };

  it('renames a field in a schema object', () => {
    const result = renameSchema(baseSchema, 'firstName', 'givenName');
    expect(result.fields.find((f) => f.name === 'givenName')).toBeDefined();
    expect(result.fields.find((f) => f.name === 'firstName')).toBeUndefined();
  });

  it('preserves other schema properties', () => {
    const result = renameSchema(baseSchema, 'firstName', 'givenName');
    expect(result.name).toBe('UserForm');
  });

  it('does not mutate the original schema', () => {
    renameSchema(baseSchema, 'firstName', 'givenName');
    expect(baseSchema.fields.find((f) => f.name === 'firstName')).toBeDefined();
  });

  it('throws if schema has no fields array', () => {
    expect(() => renameSchema({ name: 'Empty' }, 'a', 'b')).toThrow(
      'Schema must have a fields array'
    );
  });

  it('throws if schemaOrPath is invalid type', () => {
    expect(() => renameSchema(42, 'a', 'b')).toThrow(
      'schemaOrPath must be a file path string or schema object'
    );
  });
});
