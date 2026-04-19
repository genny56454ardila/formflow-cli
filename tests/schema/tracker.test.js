const {
  trackChange,
  getHistory,
  clearHistory,
  trackSchema,
  clearSchemaHistory,
  formatHistory,
} = require('../../src/schema/tracker');

const baseField = { name: 'email', type: 'text' };
const baseSchema = {
  title: 'Contact',
  fields: [{ name: 'email', type: 'text' }, { name: 'phone', type: 'text' }],
};

describe('trackChange', () => {
  it('adds a history entry to a field', () => {
    const result = trackChange(baseField, 'created', { by: 'alice' });
    expect(result._history).toHaveLength(1);
    expect(result._history[0].action).toBe('created');
    expect(result._history[0].by).toBe('alice');
  });

  it('appends to existing history', () => {
    const withOne = trackChange(baseField, 'created', { by: 'alice' });
    const withTwo = trackChange(withOne, 'updated', { by: 'bob' });
    expect(withTwo._history).toHaveLength(2);
    expect(withTwo._history[1].action).toBe('updated');
  });

  it('does not mutate the original field', () => {
    trackChange(baseField, 'created');
    expect(baseField._history).toBeUndefined();
  });

  it('uses provided timestamp', () => {
    const ts = '2024-01-01T00:00:00.000Z';
    const result = trackChange(baseField, 'created', { timestamp: ts });
    expect(result._history[0].timestamp).toBe(ts);
  });
});

describe('getHistory', () => {
  it('returns history array', () => {
    const f = trackChange(baseField, 'created');
    expect(getHistory(f)).toHaveLength(1);
  });

  it('returns empty array if no history', () => {
    expect(getHistory(baseField)).toEqual([]);
  });
});

describe('clearHistory', () => {
  it('removes _history from field', () => {
    const f = trackChange(baseField, 'created');
    const cleared = clearHistory(f);
    expect(cleared._history).toBeUndefined();
    expect(cleared.name).toBe('email');
  });
});

describe('trackSchema', () => {
  it('tracks all fields in schema', () => {
    const result = trackSchema(baseSchema, 'imported', { by: 'ci' });
    result.fields.forEach(f => {
      expect(f._history).toHaveLength(1);
      expect(f._history[0].action).toBe('imported');
    });
  });
});

describe('clearSchemaHistory', () => {
  it('clears history from all fields', () => {
    const tracked = trackSchema(baseSchema, 'imported');
    const cleared = clearSchemaHistory(tracked);
    cleared.fields.forEach(f => expect(f._history).toBeUndefined());
  });
});

describe('formatHistory', () => {
  it('formats history entries', () => {
    const f = trackChange(baseField, 'created', { by: 'alice', timestamp: '2024-01-01T00:00:00.000Z' });
    const out = formatHistory(f);
    expect(out).toContain('email');
    expect(out).toContain('created');
    expect(out).toContain('alice');
  });

  it('shows no history message when empty', () => {
    expect(formatHistory(baseField)).toBe('email: no history');
  });
});
