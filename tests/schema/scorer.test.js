const { scoreField, scoreSchema, formatScore } = require('../../src/schema/scorer');

describe('scoreField', () => {
  it('gives full score to a complete field', () => {
    const field = {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      description: 'Your email address',
      validation: { required: true },
    };
    const { score, issues } = scoreField(field);
    expect(score).toBe(100);
    expect(issues).toHaveLength(0);
  });

  it('penalizes missing label', () => {
    const field = { name: 'age', type: 'number' };
    const { score, issues } = scoreField(field);
    expect(score).toBeLessThan(100);
    expect(issues).toContain('missing label');
  });

  it('penalizes missing type', () => {
    const field = { name: 'bio', label: 'Bio' };
    const { issues } = scoreField(field);
    expect(issues).toContain('missing type');
  });

  it('returns 0 for empty field', () => {
    const { score, issues } = scoreField({});
    expect(score).toBe(0);
    expect(issues).toHaveLength(3);
  });
});

describe('scoreSchema', () => {
  it('returns zero score for empty schema', () => {
    const result = scoreSchema({ fields: [] });
    expect(result.total).toBe(0);
    expect(result.grade).toBe('F');
  });

  it('returns correct average and grade for good schema', () => {
    const schema = {
      fields: [
        { name: 'email', label: 'Email', type: 'email', placeholder: 'x', description: 'y', validation: {} },
        { name: 'name', label: 'Name', type: 'text', placeholder: 'x', description: 'y', validation: {} },
      ],
    };
    const result = scoreSchema(schema);
    expect(result.average).toBe(100);
    expect(result.grade).toBe('A');
  });

  it('handles null schema gracefully', () => {
    const result = scoreSchema(null);
    expect(result.grade).toBe('F');
  });

  it('lists per-field scores', () => {
    const schema = { fields: [{ name: 'x', label: 'X', type: 'text' }] };
    const result = scoreSchema(schema);
    expect(result.fields[0].name).toBe('x');
    expect(typeof result.fields[0].score).toBe('number');
  });
});

describe('formatScore', () => {
  it('returns a string with grade and field details', () => {
    const schema = { fields: [{ name: 'title', label: 'Title', type: 'text' }] };
    const result = scoreSchema(schema);
    const output = formatScore(result);
    expect(output).toContain('Schema Score');
    expect(output).toContain('title');
  });

  it('includes issue hints for incomplete fields', () => {
    const schema = { fields: [{ name: 'broken' }] };
    const result = scoreSchema(schema);
    const output = formatScore(result);
    expect(output).toContain('missing label');
  });
});
