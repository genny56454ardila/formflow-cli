const { renameField, renameSchema } = require('../../src/schema/renamer');

describe('renameField', () => {
  const baseField = { name: 'firstName', label: 'firstName', type: 'text', required: true };

  it('renames the field when name is in the map', () => {
    const result = renameField(baseField, { firstName: 'first_name' });
    expect(result.name).toBe('first_name');
  });

  it('updates label when it matches the old name', () => {
    const result = renameField(baseField, { firstName: 'first_name' });
    expect(result.label).toBe('first_name');
  });

  it('preserves custom label when it differs from name', () => {
    const field = { ...baseField, label: 'First Name' };
    const result = renameField(field, { firstName: 'first_name' });
    expect(result.label).toBe('First Name');
  });

  it('returns unchanged field when name not in map', () => {
    const result = renameField(baseField, { lastName: 'last_name' });
    expect(result.name).toBe('firstName');
  });

  it('preserves other field properties', () => {
    const result = renameField(baseField, { firstName: 'first_name' });
    expect(result.type).toBe('text');
    expect(result.required).toBe(true);
  });

  it('throws on invalid field', () => {
    expect(() => renameField(null, {})).toThrow('Invalid field object');
  });

  it('throws on invalid name map', () => {
    expect(() => renameField(baseField, null)).toThrow('Invalid name map');
  });
});

describe('renameSchema', () => {
  const schema = {
    name: 'UserForm',
    fields: [
      { name: 'firstName', label: 'firstName', type: 'text' },
      { name: 'lastName', label: 'Last Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
    ],
  };

  it('renames multiple fields', () => {
    const { schema: result } = renameSchema(schema, { firstName: 'first_name', lastName: 'last_name' });
    const names = result.fields.map((f) => f.name);
    expect(names).toContain('first_name');
    expect(names).toContain('last_name');
    expect(names).toContain('email');
  });

  it('returns empty conflicts array when no conflicts', () => {
    const { conflicts } = renameSchema(schema, { firstName: 'first_name' });
    expect(conflicts).toEqual([]);
  });

  it('detects conflicts when target name already exists', () => {
    const { conflicts } = renameSchema(schema, { firstName: 'email' });
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].from).toBe('firstName');
    expect(conflicts[0].to).toBe('email');
  });

  it('excludes conflicting fields from result', () => {
    const { schema: result } = renameSchema(schema, { firstName: 'email' });
    const names = result.fields.map((f) => f.name);
    expect(names.filter((n) => n === 'email').length).toBe(1);
  });

  it('throws on invalid schema', () => {
    expect(() => renameSchema(null, {})).toThrow('Invalid schema object');
  });

  it('throws when fields is not an array', () => {
    expect(() => renameSchema({ name: 'x' }, {})).toThrow('Schema must have a fields array');
  });

  it('throws on invalid name map', () => {
    expect(() => renameSchema(schema, null)).toThrow('Invalid name map');
  });
});
