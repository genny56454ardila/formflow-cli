const { summarizeSchema, formatSummary } = require('../../src/schema/summarizer');

const sampleSchema = {
  name: 'Contact Form',
  version: '1.0',
  fields: [
    { name: 'firstName', type: 'text', required: true, validation: { minLength: 1 } },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, validation: { pattern: '.+@.+' } },
    { name: 'phone', type: 'tel', required: false },
    { name: 'message', type: 'textarea', required: false },
  ],
};

describe('summarizeSchema', () => {
  it('returns correct total field count', () => {
    const summary = summarizeSchema(sampleSchema);
    expect(summary.totalFields).toBe(5);
  });

  it('returns correct required/optional counts', () => {
    const summary = summarizeSchema(sampleSchema);
    expect(summary.requiredCount).toBe(3);
    expect(summary.optionalCount).toBe(2);
  });

  it('includes schema name and version', () => {
    const summary = summarizeSchema(sampleSchema);
    expect(summary.name).toBe('Contact Form');
    expect(summary.version).toBe('1.0');
  });

  it('builds type breakdown correctly', () => {
    const summary = summarizeSchema(sampleSchema);
    expect(summary.typeBreakdown.text).toBe(2);
    expect(summary.typeBreakdown.email).toBe(1);
    expect(summary.typeBreakdown.textarea).toBe(1);
  });

  it('detects validation presence', () => {
    const summary = summarizeSchema(sampleSchema);
    expect(summary.hasValidation).toBe(true);
  });

  it('returns false for hasValidation when no fields have it', () => {
    const schema = { fields: [{ name: 'x', type: 'text' }] };
    const summary = summarizeSchema(schema);
    expect(summary.hasValidation).toBe(false);
  });

  it('uses fallback name when schema has none', () => {
    const schema = { fields: [] };
    const summary = summarizeSchema(schema);
    expect(summary.name).toBe('Unnamed Schema');
  });

  it('throws on invalid schema', () => {
    expect(() => summarizeSchema(null)).toThrow('Invalid schema');
    expect(() => summarizeSchema({ fields: 'bad' })).toThrow('Invalid schema');
  });

  it('includes generatedAt timestamp', () => {
    const summary = summarizeSchema(sampleSchema);
    expect(typeof summary.generatedAt).toBe('string');
  });
});

describe('formatSummary', () => {
  it('returns a non-empty string', () => {
    const summary = summarizeSchema(sampleSchema);
    const output = formatSummary(summary);
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  it('includes schema name in output', () => {
    const summary = summarizeSchema(sampleSchema);
    const output = formatSummary(summary);
    expect(output).toContain('Contact Form');
  });

  it('includes type breakdown in output', () => {
    const summary = summarizeSchema(sampleSchema);
    const output = formatSummary(summary);
    expect(output).toContain('text: 2');
  });
});
