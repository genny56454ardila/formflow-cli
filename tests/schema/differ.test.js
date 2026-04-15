const { diffFields, diffSchemas, diffSchemaFiles } = require('../../src/schema/differ');
const path = require('path');
const fs = require('fs');

describe('diffFields', () => {
  it('returns null when fields are identical', () => {
    const field = { name: 'email', type: 'email', required: true };
    expect(diffFields(field, { ...field })).toBeNull();
  });

  it('detects changed type', () => {
    const a = { name: 'age', type: 'text' };
    const b = { name: 'age', type: 'number' };
    const result = diffFields(a, b);
    expect(result).toHaveProperty('type');
    expect(result.type).toEqual({ from: 'text', to: 'number' });
  });

  it('detects added property', () => {
    const a = { name: 'bio', type: 'textarea' };
    const b = { name: 'bio', type: 'textarea', required: true };
    const result = diffFields(a, b);
    expect(result).toHaveProperty('required');
    expect(result.required).toEqual({ from: undefined, to: true });
  });

  it('detects removed property', () => {
    const a = { name: 'bio', type: 'textarea', placeholder: 'Enter bio' };
    const b = { name: 'bio', type: 'textarea' };
    const result = diffFields(a, b);
    expect(result).toHaveProperty('placeholder');
    expect(result.placeholder).toEqual({ from: 'Enter bio', to: undefined });
  });
});

describe('diffSchemas', () => {
  const base = {
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'email', type: 'email' }
    ]
  };

  it('detects added fields', () => {
    const next = { fields: [...base.fields, { name: 'phone', type: 'tel' }] };
    const result = diffSchemas(base, next);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].name).toBe('phone');
    expect(result.hasChanges).toBe(true);
  });

  it('detects removed fields', () => {
    const next = { fields: [base.fields[0]] };
    const result = diffSchemas(base, next);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].name).toBe('email');
  });

  it('detects modified fields', () => {
    const next = {
      fields: [
        { name: 'username', type: 'text', required: false },
        { name: 'email', type: 'email' }
      ]
    };
    const result = diffSchemas(base, next);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].name).toBe('username');
  });

  it('reports no changes for identical schemas', () => {
    const result = diffSchemas(base, { fields: [...base.fields] });
    expect(result.hasChanges).toBe(false);
  });
});
