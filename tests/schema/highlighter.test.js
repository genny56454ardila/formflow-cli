const { highlightField, highlightSchema, formatHighlighted } = require('../../src/schema/highlighter');

const stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*m/g, '');

const baseSchema = {
  name: 'TestForm',
  fields: [
    { name: 'email', type: 'text', label: 'Email Address' },
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'age', type: 'number', label: 'Your Age' },
  ],
};

describe('highlightField', () => {
  it('highlights matching term in string values', () => {
    const field = { name: 'email', type: 'text', label: 'Email Address' };
    const result = highlightField(field, 'email');
    expect(stripAnsi(result.name)).toBe('email');
    expect(result.name).not.toBe('email'); // has ansi codes
  });

  it('returns field unchanged when no term provided', () => {
    const field = { name: 'email', type: 'text' };
    expect(highlightField(field, '')).toEqual(field);
    expect(highlightField(field, null)).toEqual(field);
  });

  it('does not modify non-string values', () => {
    const field = { name: 'count', type: 'number', required: true, min: 1 };
    const result = highlightField(field, 'count');
    expect(result.required).toBe(true);
    expect(result.min).toBe(1);
  });

  it('highlights term in label when it matches', () => {
    const field = { name: 'email', type: 'text', label: 'Email Address' };
    const result = highlightField(field, 'Address');
    expect(stripAnsi(result.label)).toBe('Email Address');
    expect(result.label).not.toBe('Email Address'); // has ansi codes
  });
});

describe('highlightSchema', () => {
  it('throws on invalid schema', () => {
    expect(() => highlightSchema(null, 'x')).toThrow('Invalid schema');
    expect(() => highlightSchema({ fields: 'bad' }, 'x')).toThrow('Invalid schema');
  });

  it('returns schema unchanged when term is empty', () => {
    const result = highlightSchema(baseSchema, '');
    expect(result).toEqual(baseSchema);
  });

  it('highlights matching fields', () => {
    const result = highlightSchema(baseSchema, 'email');
    const emailField = result.fields.find((f) => stripAnsi(f.name) === 'email');
    expect(emailField).toBeDefined();
    expect(emailField.name).not.toBe('email');
  });

  it('preserves non-matching fields', () => {
    const result = highlightSchema(baseSchema, 'email');
    const ageField = result.fields.find((f) => stripAnsi(f.name) === 'age');
    expect(ageField.name).toBe('age');
  });

  it('does not mutate the original schema', () => {
    const original = JSON.parse(JSON.stringify(baseSchema));
    highlightSchema(baseSchema, 'email');
    expect(baseSchema).toEqual(original);
  });
});

describe('formatHighlighted', () => {
  it('returns a formatted string', () => {
    const output = formatHighlighted(baseSchema, 'email');
    const plain = stripAnsi(output);
    expect(plain).toContain('TestForm');
    expect(plain).toContain('email');
    expect(plain).toContain('username');
  });

  it('includes field count in header', () => {
    const output = stripAnsi(formatHighlighted(baseSchema, 'age'));
    expect(output).toContain('3 fields');
  });
});
