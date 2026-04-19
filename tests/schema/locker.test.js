const { lockField, unlockField, lockFieldInSchema, unlockFieldInSchema, listLockedFields } = require('../../src/schema/locker');

const baseSchema = {
  name: 'test',
  fields: [
    { name: 'email', type: 'email' },
    { name: 'age', type: 'number', locked: true },
    { name: 'username', type: 'text' }
  ]
};

describe('lockField', () => {
  it('sets locked to true', () => {
    const result = lockField({ name: 'email', type: 'email' });
    expect(result.locked).toBe(true);
  });

  it('does not mutate original', () => {
    const field = { name: 'x', type: 'text' };
    lockField(field);
    expect(field.locked).toBeUndefined();
  });
});

describe('unlockField', () => {
  it('removes locked property', () => {
    const result = unlockField({ name: 'age', type: 'number', locked: true });
    expect(result.locked).toBeUndefined();
  });

  it('leaves unlocked field unchanged', () => {
    const field = { name: 'x', type: 'text' };
    const result = unlockField(field);
    expect(result).toEqual(field);
  });
});

describe('lockFieldInSchema', () => {
  it('locks the specified field', () => {
    const result = lockFieldInSchema(baseSchema, 'email');
    const field = result.fields.find(f => f.name === 'email');
    expect(field.locked).toBe(true);
  });

  it('throws if field not found', () => {
    expect(() => lockFieldInSchema(baseSchema, 'nope')).toThrow('Field "nope" not found');
  });

  it('does not affect other fields', () => {
    const result = lockFieldInSchema(baseSchema, 'email');
    const username = result.fields.find(f => f.name === 'username');
    expect(username.locked).toBeUndefined();
  });
});

describe('unlockFieldInSchema', () => {
  it('unlocks the specified field', () => {
    const result = unlockFieldInSchema(baseSchema, 'age');
    const field = result.fields.find(f => f.name === 'age');
    expect(field.locked).toBeUndefined();
  });

  it('throws if field not found', () => {
    expect(() => unlockFieldInSchema(baseSchema, 'ghost')).toThrow('Field "ghost" not found');
  });
});

describe('listLockedFields', () => {
  it('returns names of locked fields', () => {
    expect(listLockedFields(baseSchema)).toEqual(['age']);
  });

  it('returns empty array when none locked', () => {
    expect(listLockedFields({ fields: [{ name: 'a' }] })).toEqual([]);
  });
});
