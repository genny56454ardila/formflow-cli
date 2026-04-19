const {
  pinField,
  unpinField,
  pinFieldInSchema,
  unpinFieldInSchema,
  listPinnedFields,
  applyPinOrder,
} = require('../../src/schema/pinner');

const baseSchema = {
  name: 'TestForm',
  fields: [
    { name: 'email', type: 'email' },
    { name: 'username', type: 'text' },
    { name: 'age', type: 'number' },
  ],
};

describe('pinField', () => {
  it('sets pinned to true on a field', () => {
    const result = pinField({ name: 'email', type: 'email' });
    expect(result.pinned).toBe(true);
    expect(result.name).toBe('email');
  });

  it('does not mutate original field', () => {
    const f = { name: 'x', type: 'text' };
    pinField(f);
    expect(f.pinned).toBeUndefined();
  });
});

describe('unpinField', () => {
  it('removes pinned property', () => {
    const f = { name: 'email', type: 'email', pinned: true };
    const result = unpinField(f);
    expect(result.pinned).toBeUndefined();
  });
});

describe('pinFieldInSchema', () => {
  it('pins a field by name', () => {
    const result = pinFieldInSchema(baseSchema, 'age');
    const age = result.fields.find(f => f.name === 'age');
    expect(age.pinned).toBe(true);
  });

  it('throws if field not found', () => {
    expect(() => pinFieldInSchema(baseSchema, 'missing')).toThrow('Field "missing" not found');
  });
});

describe('unpinFieldInSchema', () => {
  it('unpins a field by name', () => {
    const schema = pinFieldInSchema(baseSchema, 'username');
    const result = unpinFieldInSchema(schema, 'username');
    const f = result.fields.find(f => f.name === 'username');
    expect(f.pinned).toBeUndefined();
  });
});

describe('listPinnedFields', () => {
  it('returns names of pinned fields', () => {
    const schema = pinFieldInSchema(pinFieldInSchema(baseSchema, 'email'), 'age');
    expect(listPinnedFields(schema)).toEqual(['email', 'age']);
  });

  it('returns empty array when none pinned', () => {
    expect(listPinnedFields(baseSchema)).toEqual([]);
  });
});

describe('applyPinOrder', () => {
  it('moves pinned fields to the front', () => {
    const schema = pinFieldInSchema(baseSchema, 'age');
    const result = applyPinOrder(schema);
    expect(result.fields[0].name).toBe('age');
  });

  it('preserves relative order of unpinned fields', () => {
    const schema = pinFieldInSchema(baseSchema, 'username');
    const result = applyPinOrder(schema);
    const names = result.fields.map(f => f.name);
    expect(names).toEqual(['username', 'email', 'age']);
  });
});
