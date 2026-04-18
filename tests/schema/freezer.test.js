const { freezeField, unfreezeField, freezeSchema, unfreezeSchema, listFrozenFields } = require('../../src/schema/freezer');

const sampleSchema = {
  name: 'TestForm',
  fields: [
    { name: 'email', type: 'email' },
    { name: 'age', type: 'number' },
    { name: 'bio', type: 'text', frozen: true }
  ]
};

describe('freezeField', () => {
  it('marks field as frozen', () => {
    const result = freezeField({ name: 'email', type: 'email' });
    expect(result.frozen).toBe(true);
  });
  it('does not mutate original', () => {
    const f = { name: 'x', type: 'text' };
    freezeField(f);
    expect(f.frozen).toBeUndefined();
  });
  it('throws on invalid input', () => {
    expect(() => freezeField(null)).toThrow('Invalid field');
  });
});

describe('unfreezeField', () => {
  it('removes frozen flag', () => {
    const result = unfreezeField({ name: 'bio', type: 'text', frozen: true });
    expect(result.frozen).toBeUndefined();
  });
  it('handles field without frozen flag', () => {
    const result = unfreezeField({ name: 'x', type: 'text' });
    expect(result.frozen).toBeUndefined();
  });
});

describe('freezeSchema', () => {
  it('freezes all fields when no names given', () => {
    const result = freezeSchema(sampleSchema);
    expect(result.fields.every(f => f.frozen)).toBe(true);
  });
  it('freezes only specified fields', () => {
    const result = freezeSchema(sampleSchema, ['email']);
    const emailField = result.fields.find(f => f.name === 'email');
    const ageField = result.fields.find(f => f.name === 'age');
    expect(emailField.frozen).toBe(true);
    expect(ageField.frozen).toBeUndefined();
  });
  it('throws on invalid schema', () => {
    expect(() => freezeSchema(null)).toThrow('Invalid schema');
  });
});

describe('unfreezeSchema', () => {
  it('unfreezes all fields', () => {
    const frozen = freezeSchema(sampleSchema);
    const result = unfreezeSchema(frozen);
    expect(result.fields.every(f => !f.frozen)).toBe(true);
  });
});

describe('listFrozenFields', () => {
  it('returns names of frozen fields', () => {
    const result = listFrozenFields(sampleSchema);
    expect(result).toEqual(['bio']);
  });
  it('returns empty array when none frozen', () => {
    const schema = { fields: [{ name: 'x', type: 'text' }] };
    expect(listFrozenFields(schema)).toEqual([]);
  });
});
