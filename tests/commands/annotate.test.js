const fs = require('fs');
const path = require('path');
const { runAnnotate } = require('../../src/commands/annotate');
const { loadSchema } = require('../../src/schema/loader');

jest.mock('fs');
jest.mock('../../src/schema/loader');

const baseSchema = {
  fields: [
    { name: 'email', type: 'text' },
    { name: 'age', type: 'number' }
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSchema.mockReturnValue(JSON.parse(JSON.stringify(baseSchema)));
  fs.writeFileSync.mockImplementation(() => {});
});

describe('runAnnotate', () => {
  it('adds an annotation and writes file', async () => {
    const logs = [];
    const code = await runAnnotate(
      { input: 'schema.json', field: 'email', key: 'hint', value: 'Enter email' },
      { log: m => logs.push(m), error: jest.fn() }
    );
    expect(code).toBe(0);
    expect(logs[0]).toContain('Annotated');
    expect(fs.writeFileSync).toHaveBeenCalled();
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written.fields[0].annotations).toEqual({ hint: 'Enter email' });
  });

  it('removes an annotation', async () => {
    loadSchema.mockReturnValue({
      fields: [{ name: 'email', type: 'text', annotations: { hint: 'hi' } }]
    });
    const logs = [];
    const code = await runAnnotate(
      { input: 'schema.json', field: 'email', key: 'hint', remove: true },
      { log: m => logs.push(m), error: jest.fn() }
    );
    expect(code).toBe(0);
    expect(logs[0]).toContain('Removed');
  });

  it('lists annotations', async () => {
    loadSchema.mockReturnValue({
      fields: [{ name: 'email', type: 'text', annotations: { hint: 'hi', tooltip: 'tip' } }]
    });
    const logs = [];
    const code = await runAnnotate(
      { input: 'schema.json', field: 'email', list: true },
      { log: m => logs.push(m), error: jest.fn() }
    );
    expect(code).toBe(0);
    expect(logs.some(l => l.includes('hint'))).toBe(true);
  });

  it('returns 1 when schema fails to load', async () => {
    loadSchema.mockImplementation(() => { throw new Error('not found'); });
    const errs = [];
    const code = await runAnnotate(
      { input: 'bad.json', field: 'email', key: 'k', value: 'v' },
      { log: jest.fn(), error: m => errs.push(m) }
    );
    expect(code).toBe(1);
    expect(errs[0]).toContain('Failed to load');
  });

  it('returns 1 when key missing', async () => {
    const errs = [];
    const code = await runAnnotate(
      { input: 'schema.json', field: 'email' },
      { log: jest.fn(), error: m => errs.push(m) }
    );
    expect(code).toBe(1);
  });
});
