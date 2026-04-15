const { formatSchema, formatField, formatErrors } = require('../../src/schema/formatter');

// Strip ANSI color codes for easier assertion
function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

describe('formatField', () => {
  it('should include field name and type', () => {
    const field = { name: 'email', type: 'text' };
    const result = stripAnsi(formatField(field, 0));
    expect(result).toContain('email');
    expect(result).toContain('text');
  });

  it('should show Required when field is required', () => {
    const field = { name: 'username', type: 'text', required: true };
    const result = stripAnsi(formatField(field, 0));
    expect(result).toContain('Required');
  });

  it('should display validation rules if present', () => {
    const field = { name: 'age', type: 'number', validation: { min: 0, max: 120 } };
    const result = stripAnsi(formatField(field, 1));
    expect(result).toContain('min: 0');
    expect(result).toContain('max: 120');
  });

  it('should display placeholder if present', () => {
    const field = { name: 'bio', type: 'textarea', placeholder: 'Tell us about yourself' };
    const result = stripAnsi(formatField(field, 2));
    expect(result).toContain('Tell us about yourself');
  });
});

describe('formatSchema', () => {
  const sampleSchema = {
    name: 'Registration Form',
    description: 'User registration',
    version: '1.0.0',
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
    ],
  };

  it('should include the form name', () => {
    const result = stripAnsi(formatSchema(sampleSchema));
    expect(result).toContain('Registration Form');
  });

  it('should include the description', () => {
    const result = stripAnsi(formatSchema(sampleSchema));
    expect(result).toContain('User registration');
  });

  it('should list field count', () => {
    const result = stripAnsi(formatSchema(sampleSchema));
    expect(result).toContain('Fields (2)');
  });

  it('should show no fields message when fields array is empty', () => {
    const result = stripAnsi(formatSchema({ name: 'Empty Form', fields: [] }));
    expect(result).toContain('No fields defined.');
  });

  it('should throw on invalid input', () => {
    expect(() => formatSchema(null)).toThrow('Invalid schema');
    expect(() => formatSchema('bad')).toThrow('Invalid schema');
  });
});

describe('formatErrors', () => {
  it('should return valid message when no errors', () => {
    const result = stripAnsi(formatErrors([]));
    expect(result).toContain('Schema is valid');
  });

  it('should list all errors', () => {
    const errors = ['Field name is required', 'Invalid type: foo'];
    const result = stripAnsi(formatErrors(errors));
    expect(result).toContain('2 error(s)');
    expect(result).toContain('Field name is required');
    expect(result).toContain('Invalid type: foo');
  });

  it('should handle null errors gracefully', () => {
    const result = stripAnsi(formatErrors(null));
    expect(result).toContain('Schema is valid');
  });
});
