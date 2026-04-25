const { classifyField, classifySchema, computeComplexity, buildClassificationSummary } = require('../../src/schema/classifier');

describe('classifyField', () => {
  it('classifies a text field correctly', () => {
    const field = { name: 'username', type: 'text', required: true };
    const result = classifyField(field);
    expect(result._classification.category).toBe('text');
    expect(result._classification.isRequired).toBe(true);
  });

  it('classifies a select field as choice', () => {
    const field = { name: 'country', type: 'select', options: ['US', 'UK'] };
    const result = classifyField(field);
    expect(result._classification.category).toBe('choice');
  });

  it('classifies a date field as temporal', () => {
    const field = { name: 'dob', type: 'date' };
    const result = classifyField(field);
    expect(result._classification.category).toBe('temporal');
  });

  it('classifies unknown type as unknown', () => {
    const field = { name: 'custom', type: 'widget' };
    const result = classifyField(field);
    expect(result._classification.category).toBe('unknown');
  });

  it('detects hasValidation when validation is present', () => {
    const field = { name: 'age', type: 'number', min: 0, max: 120 };
    const result = classifyField(field);
    expect(result._classification.hasValidation).toBe(true);
  });

  it('detects hasDefault when default is set', () => {
    const field = { name: 'active', type: 'checkbox', default: false };
    const result = classifyField(field);
    expect(result._classification.hasDefault).toBe(true);
  });

  it('throws on invalid field', () => {
    expect(() => classifyField(null)).toThrow('Invalid field');
    expect(() => classifyField('string')).toThrow('Invalid field');
  });

  it('preserves original field properties', () => {
    const field = { name: 'email', type: 'email', placeholder: 'Enter email' };
    const result = classifyField(field);
    expect(result.name).toBe('email');
    expect(result.placeholder).toBe('Enter email');
  });
});

describe('computeComplexity', () => {
  it('returns simple for a plain field', () => {
    expect(computeComplexity({ name: 'x', type: 'text' })).toBe('simple');
  });

  it('returns moderate for a field with some rules', () => {
    expect(computeComplexity({ required: true, validation: { minLength: 3 } })).toBe('moderate');
  });

  it('returns complex for a heavily constrained field', () => {
    const field = { required: true, validation: {}, pattern: '.*', dependencies: ['a', 'b'], transform: 'trim' };
    expect(computeComplexity(field)).toBe('complex');
  });
});

describe('classifySchema', () => {
  const schema = {
    name: 'test',
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'age', type: 'number' },
      { name: 'role', type: 'select', options: ['admin', 'user'] },
    ],
  };

  it('classifies all fields in a schema', () => {
    const result = classifySchema(schema);
    expect(result.fields).toHaveLength(3);
    result.fields.forEach(f => expect(f._classification).toBeDefined());
  });

  it('generates a classification summary', () => {
    const result = classifySchema(schema);
    expect(result._classificationSummary.total).toBe(3);
    expect(result._classificationSummary.categories.text).toBe(1);
    expect(result._classificationSummary.categories.numeric).toBe(1);
    expect(result._classificationSummary.categories.choice).toBe(1);
  });

  it('throws on invalid schema', () => {
    expect(() => classifySchema({})).toThrow('Invalid schema');
    expect(() => classifySchema(null)).toThrow('Invalid schema');
  });
});
