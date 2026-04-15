const { applyPatch, patchSchema } = require('../../src/schema/patcher');

const baseSchema = {
  name: 'TestForm',
  fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'number', required: false },
  ],
};

describe('applyPatch', () => {
  it('sets a key on a field', () => {
    const result = applyPatch(baseSchema.fields, { op: 'set', field: 'email', key: 'label', value: 'Email Address' });
    expect(result[0].label).toBe('Email Address');
  });

  it('unsets a key from a field', () => {
    const result = applyPatch(baseSchema.fields, { op: 'unset', field: 'email', key: 'required' });
    expect(result[0].required).toBeUndefined();
  });

  it('renames a field', () => {
    const result = applyPatch(baseSchema.fields, { op: 'rename', field: 'age', newName: 'userAge' });
    expect(result[1].name).toBe('userAge');
  });

  it('throws if field not found', () => {
    expect(() => applyPatch(baseSchema.fields, { op: 'set', field: 'missing', key: 'x', value: 1 }))
      .toThrow('Field "missing" not found');
  });

  it('throws on unknown op', () => {
    expect(() => applyPatch(baseSchema.fields, { op: 'delete', field: 'email' }))
      .toThrow('Unknown patch op: "delete"');
  });

  it('throws if field name not specified', () => {
    expect(() => applyPatch(baseSchema.fields, { op: 'set', key: 'x', value: 1 }))
      .toThrow('Patch must specify a field name');
  });

  it('does not mutate original fields', () => {
    applyPatch(baseSchema.fields, { op: 'set', field: 'email', key: 'label', value: 'X' });
    expect(baseSchema.fields[0].label).toBeUndefined();
  });
});

describe('patchSchema', () => {
  it('applies multiple patches in sequence', () => {
    const patches = [
      { op: 'set', field: 'email', key: 'label', value: 'Your Email' },
      { op: 'rename', field: 'age', newName: 'userAge' },
    ];
    const result = patchSchema(baseSchema, patches);
    expect(result.fields[0].label).toBe('Your Email');
    expect(result.fields[1].name).toBe('userAge');
  });

  it('preserves schema metadata', () => {
    const result = patchSchema(baseSchema, [{ op: 'set', field: 'email', key: 'placeholder', value: 'you@example.com' }]);
    expect(result.name).toBe('TestForm');
  });

  it('throws if patches is empty', () => {
    expect(() => patchSchema(baseSchema, [])).toThrow('patches must be a non-empty array');
  });

  it('throws if patches is not an array', () => {
    expect(() => patchSchema(baseSchema, null)).toThrow('patches must be a non-empty array');
  });
});
