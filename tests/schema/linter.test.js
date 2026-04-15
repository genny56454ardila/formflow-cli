const { lintField, lintSchema, LINT_RULES } = require('../../src/schema/linter');

describe('lintField', () => {
  it('warns when label is missing', () => {
    const warnings = lintField({ id: 'name', type: 'text' }, new Set());
    expect(warnings.some(w => w.rule === LINT_RULES.MISSING_LABEL)).toBe(true);
  });

  it('warns when label is too long', () => {
    const longLabel = 'A'.repeat(81);
    const warnings = lintField({ id: 'name', type: 'text', label: longLabel }, new Set());
    expect(warnings.some(w => w.rule === LINT_RULES.LONG_LABEL)).toBe(true);
  });

  it('warns on duplicate id', () => {
    const seen = new Set(['email']);
    const warnings = lintField({ id: 'email', type: 'email', label: 'Email' }, seen);
    expect(warnings.some(w => w.rule === LINT_RULES.DUPLICATE_ID)).toBe(true);
  });

  it('warns when select has no options', () => {
    const warnings = lintField({ id: 'role', type: 'select', label: 'Role' }, new Set());
    expect(warnings.some(w => w.rule === LINT_RULES.EMPTY_OPTIONS)).toBe(true);
  });

  it('does not warn when select has options', () => {
    const warnings = lintField({ id: 'role', type: 'select', label: 'Role', options: ['admin', 'user'] }, new Set());
    expect(warnings.some(w => w.rule === LINT_RULES.EMPTY_OPTIONS)).toBe(false);
  });

  it('warns when text field has no placeholder', () => {
    const warnings = lintField({ id: 'username', type: 'text', label: 'Username' }, new Set());
    expect(warnings.some(w => w.rule === LINT_RULES.MISSING_PLACEHOLDER)).toBe(true);
  });

  it('returns no warnings for a clean field', () => {
    const warnings = lintField({ id: 'username', type: 'text', label: 'Username', placeholder: 'Enter username' }, new Set());
    expect(warnings).toHaveLength(0);
  });
});

describe('lintSchema', () => {
  it('returns error for invalid schema', () => {
    const result = lintSchema(null);
    expect(result[0].rule).toBe('INVALID_SCHEMA');
  });

  it('returns error when fields is not an array', () => {
    const result = lintSchema({ fields: 'bad' });
    expect(result[0].rule).toBe('INVALID_SCHEMA');
  });

  it('aggregates warnings across all fields', () => {
    const schema = {
      fields: [
        { id: 'a', type: 'text' },
        { id: 'a', type: 'email', label: 'Email' },
      ],
    };
    const warnings = lintSchema(schema);
    const rules = warnings.map(w => w.rule);
    expect(rules).toContain(LINT_RULES.MISSING_LABEL);
    expect(rules).toContain(LINT_RULES.DUPLICATE_ID);
  });

  it('returns empty array for a clean schema', () => {
    const schema = {
      fields: [
        { id: 'username', type: 'text', label: 'Username', placeholder: 'Enter username' },
      ],
    };
    expect(lintSchema(schema)).toHaveLength(0);
  });
});
