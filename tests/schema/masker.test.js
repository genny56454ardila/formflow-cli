const { maskField, unmaskField, maskSchema, unmaskSchema, listMaskedFields } = require('../../src/schema/masker');

const baseSchema = {
  name: 'UserForm',
  fields: [
    { name: 'username', type: 'text' },
    { name: 'password', type: 'text' },
    { name: 'token', type: 'text' },
    { name: 'email', type: 'email' }
  ]
};

describe('maskField', () => {
  it('marks field as masked and sets defaultValue', () => {
    const result = maskField({ name: 'password', type: 'text' });
    expect(result.masked).toBe(true);
    expect(result.defaultValue).toBe('***');
  });

  it('respects custom maskChar', () => {
    const result = maskField({ name: 'secret', type: 'text' }, '[REDACTED]');
    expect(result.defaultValue).toBe('[REDACTED]');
  });
});

describe('unmaskField', () => {
  it('removes masked and defaultValue from field', () => {
    const masked = { name: 'password', type: 'text', masked: true, defaultValue: '***' };
    const result = unmaskField(masked);
    expect(result.masked).toBeUndefined();
    expect(result.defaultValue).toBeUndefined();
    expect(result.name).toBe('password');
  });
});

describe('maskSchema', () => {
  it('masks default sensitive fields when no targets given', () => {
    const result = maskSchema(baseSchema);
    const pw = result.fields.find(f => f.name === 'password');
    const tk = result.fields.find(f => f.name === 'token');
    const un = result.fields.find(f => f.name === 'username');
    expect(pw.masked).toBe(true);
    expect(tk.masked).toBe(true);
    expect(un.masked).toBeUndefined();
  });

  it('masks only specified targets', () => {
    const result = maskSchema(baseSchema, ['email']);
    const em = result.fields.find(f => f.name === 'email');
    const pw = result.fields.find(f => f.name === 'password');
    expect(em.masked).toBe(true);
    expect(pw.masked).toBeUndefined();
  });

  it('throws on invalid schema', () => {
    expect(() => maskSchema(null)).toThrow('Invalid schema');
    expect(() => maskSchema({ name: 'x' })).toThrow('Invalid schema');
  });
});

describe('unmaskSchema', () => {
  it('removes masking from all masked fields', () => {
    const masked = maskSchema(baseSchema);
    const result = unmaskSchema(masked);
    result.fields.forEach(f => {
      expect(f.masked).toBeUndefined();
    });
  });
});

describe('listMaskedFields', () => {
  it('returns names of masked fields', () => {
    const masked = maskSchema(baseSchema);
    const names = listMaskedFields(masked);
    expect(names).toContain('password');
    expect(names).toContain('token');
    expect(names).not.toContain('username');
  });

  it('returns empty array when nothing is masked', () => {
    expect(listMaskedFields(baseSchema)).toEqual([]);
  });
});
