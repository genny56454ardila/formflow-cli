const { compareFields, compareSchemas } = require('../../src/schema/comparator');

const baseField = { name: 'email', type: 'email', required: true, label: 'Email' };

describe('compareFields', () => {
  test('identical fields score 1', () => {
    expect(compareFields(baseField, { ...baseField })).toBe(1);
  });

  test('completely different fields score low', () => {
    const other = { name: 'age', type: 'number', required: false, label: 'Age' };
    const score = compareFields(baseField, other);
    expect(score).toBeLessThan(0.5);
  });

  test('returns 0 if either field is null', () => {
    expect(compareFields(null, baseField)).toBe(0);
    expect(compareFields(baseField, null)).toBe(0);
  });

  test('compares options arrays', () => {
    const a = { ...baseField, type: 'select', options: [{ value: 'x' }, { value: 'y' }] };
    const b = { ...baseField, type: 'select', options: [{ value: 'y' }, { value: 'x' }] };
    expect(compareFields(a, b)).toBe(1);
  });

  test('penalises differing options', () => {
    const a = { ...baseField, type: 'select', options: [{ value: 'x' }] };
    const b = { ...baseField, type: 'select', options: [{ value: 'z' }] };
    expect(compareFields(a, b)).toBeLessThan(1);
  });

  test('compares validators arrays', () => {
    const a = { ...baseField, validators: ['minLength', 'maxLength'] };
    const b = { ...baseField, validators: ['maxLength', 'minLength'] };
    expect(compareFields(a, b)).toBe(1);
  });
});

describe('compareSchemas', () => {
  const schemaA = {
    id: 'form-a',
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
    ],
  };

  const schemaB = {
    id: 'form-b',
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'phone', type: 'tel', required: false },
    ],
  };

  test('returns fieldComparisons and overallSimilarity', () => {
    const result = compareSchemas(schemaA, schemaB);
    expect(result).toHaveProperty('fieldComparisons');
    expect(result).toHaveProperty('overallSimilarity');
  });

  test('identical schemas have similarity 1', () => {
    const result = compareSchemas(schemaA, schemaA);
    expect(result.overallSimilarity).toBe(1);
  });

  test('marks fields only in A or B correctly', () => {
    const result = compareSchemas(schemaA, schemaB);
    const emailEntry = result.fieldComparisons.find(f => f.name === 'email');
    expect(emailEntry.inA).toBe(true);
    expect(emailEntry.inB).toBe(false);
    expect(emailEntry.similarity).toBe(0);
  });

  test('shared fields are compared', () => {
    const result = compareSchemas(schemaA, schemaB);
    const usernameEntry = result.fieldComparisons.find(f => f.name === 'username');
    expect(usernameEntry.similarity).toBe(1);
  });

  test('throws on invalid schemas', () => {
    expect(() => compareSchemas({}, schemaA)).toThrow();
  });
});
