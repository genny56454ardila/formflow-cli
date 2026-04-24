const {
  auditField,
  auditSchema,
  getAuditLog,
  clearAuditLog,
  formatAuditLog,
} = require('../../src/schema/auditor');

const baseField = { name: 'email', type: 'text', required: true };
const baseSchema = {
  title: 'Contact Form',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
  ],
};

describe('auditField', () => {
  it('adds an audit entry to a field with no prior log', () => {
    const result = auditField(baseField, 'read');
    expect(result.auditLog).toHaveLength(1);
    expect(result.auditLog[0].action).toBe('read');
    expect(result.auditLog[0].fieldName).toBe('email');
    expect(result.auditLog[0].timestamp).toBeDefined();
  });

  it('appends to an existing audit log', () => {
    const first = auditField(baseField, 'read');
    const second = auditField(first, 'write', { user: 'alice' });
    expect(second.auditLog).toHaveLength(2);
    expect(second.auditLog[1].action).toBe('write');
    expect(second.auditLog[1].user).toBe('alice');
  });

  it('does not mutate the original field', () => {
    auditField(baseField, 'read');
    expect(baseField.auditLog).toBeUndefined();
  });

  it('throws on unknown action', () => {
    expect(() => auditField(baseField, 'fly')).toThrow('Unknown audit action');
  });

  it('throws on invalid field', () => {
    expect(() => auditField(null, 'read')).toThrow('Invalid field');
    expect(() => auditField({}, 'read')).toThrow('Invalid field');
  });
});

describe('auditSchema', () => {
  it('audits all fields when no fieldNames provided', () => {
    const result = auditSchema(baseSchema, 'export');
    result.fields.forEach(f => {
      expect(f.auditLog).toHaveLength(1);
      expect(f.auditLog[0].action).toBe('export');
    });
  });

  it('audits only specified fields', () => {
    const result = auditSchema(baseSchema, 'validate', ['email']);
    const email = result.fields.find(f => f.name === 'email');
    const phone = result.fields.find(f => f.name === 'phone');
    expect(email.auditLog).toHaveLength(1);
    expect(phone.auditLog).toBeUndefined();
  });

  it('throws if a specified field is not found', () => {
    expect(() => auditSchema(baseSchema, 'read', ['missing'])).toThrow('Fields not found');
  });

  it('throws on invalid schema', () => {
    expect(() => auditSchema(null, 'read')).toThrow('Invalid schema');
    expect(() => auditSchema({ title: 'x' }, 'read')).toThrow('Invalid schema');
  });
});

describe('getAuditLog', () => {
  it('returns empty array when no log exists', () => {
    expect(getAuditLog(baseField)).toEqual([]);
  });

  it('returns the audit log', () => {
    const audited = auditField(baseField, 'delete');
    expect(getAuditLog(audited)).toHaveLength(1);
  });
});

describe('clearAuditLog', () => {
  it('removes the auditLog property', () => {
    const audited = auditField(baseField, 'read');
    const cleared = clearAuditLog(audited);
    expect(cleared.auditLog).toBeUndefined();
    expect(cleared.name).toBe('email');
  });
});

describe('formatAuditLog', () => {
  it('returns a no-entries message for empty log', () => {
    const result = formatAuditLog(baseField);
    expect(result).toContain('No audit entries');
  });

  it('formats entries with index and action', () => {
    const audited = auditField(auditField(baseField, 'read'), 'write', { user: 'bob' });
    const result = formatAuditLog(audited);
    expect(result).toContain('Audit log for "email"');
    expect(result).toContain('[1]');
    expect(result).toContain('READ');
    expect(result).toContain('[2]');
    expect(result).toContain('WRITE');
    expect(result).toContain('by bob');
  });
});
