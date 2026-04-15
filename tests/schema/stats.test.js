const { fieldStats, schemaStats } = require('../../src/schema/stats');

describe('fieldStats', () => {
  it('returns basic stats for a simple field', () => {
    const field = { name: 'email', type: 'email', required: true, label: 'Email' };
    const result = fieldStats(field);
    expect(result.name).toBe('email');
    expect(result.type).toBe('email');
    expect(result.required).toBe(true);
    expect(result.hasLabel).toBe(true);
    expect(result.hasValidation).toBe(false);
    expect(result.hasDefault).toBe(false);
    expect(result.hasPlaceholder).toBe(false);
  });

  it('detects validation, default, and placeholder', () => {
    const field = {
      name: 'age',
      type: 'number',
      required: false,
      validation: { min: 0, max: 120 },
      default: 18,
      placeholder: 'Enter age',
    };
    const result = fieldStats(field);
    expect(result.hasValidation).toBe(true);
    expect(result.hasDefault).toBe(true);
    expect(result.hasPlaceholder).toBe(true);
    expect(result.required).toBe(false);
  });

  it('uses unknown type when type is missing', () => {
    const field = { name: 'mystery' };
    expect(fieldStats(field).type).toBe('unknown');
  });
});

describe('schemaStats', () => {
  const schema = {
    name: 'signup',
    fields: [
      { name: 'username', type: 'text', required: true, label: 'Username', validation: { minLength: 3 } },
      { name: 'email', type: 'email', required: true, label: 'Email' },
      { name: 'age', type: 'number', required: false, default: 18 },
      { name: 'bio', type: 'textarea', required: false, placeholder: 'Tell us about yourself' },
    ],
  };

  it('counts total, required, and optional fields', () => {
    const result = schemaStats(schema);
    expect(result.totalFields).toBe(4);
    expect(result.requiredFields).toBe(2);
    expect(result.optionalFields).toBe(2);
  });

  it('counts types correctly', () => {
    const result = schemaStats(schema);
    expect(result.typeCounts.text).toBe(1);
    expect(result.typeCounts.email).toBe(1);
    expect(result.typeCounts.number).toBe(1);
    expect(result.typeCounts.textarea).toBe(1);
  });

  it('counts fields with validation and defaults', () => {
    const result = schemaStats(schema);
    expect(result.fieldsWithValidation).toBe(1);
    expect(result.fieldsWithDefaults).toBe(1);
  });

  it('includes field details array', () => {
    const result = schemaStats(schema);
    expect(result.fieldDetails).toHaveLength(4);
    expect(result.fieldDetails[0].name).toBe('username');
  });

  it('throws on invalid schema', () => {
    expect(() => schemaStats(null)).toThrow('Invalid schema');
    expect(() => schemaStats({ fields: 'nope' })).toThrow('Invalid schema');
  });

  it('uses unnamed when schema has no name', () => {
    const result = schemaStats({ fields: [] });
    expect(result.name).toBe('unnamed');
  });
});
