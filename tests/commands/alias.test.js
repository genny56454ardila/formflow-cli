const fs = require('fs');
const path = require('path');
const { resolveInputPath, runAlias } = require('../../src/commands/alias');

jest.mock('fs');
jest.mock('../../src/schema/loader');

const { loadSchema } = require('../../src/schema/loader');

const mockSchema = {
  title: 'Test',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text', aliases: ['mobile'] }
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(mockSchema)));
  fs.writeFileSync = jest.fn();
});

describe('resolveInputPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/tmp/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative path', () => {
    const result = resolveInputPath('schema.json');
    expect(path.isAbsolute(result)).toBe(true);
  });
});

describe('runAlias', () => {
  it('adds alias and writes file', async () => {
    await runAlias({ input: 'schema.json', field: 'email', alias: 'e-mail' });
    expect(fs.writeFileSync).toHaveBeenCalled();
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    const f = written.fields.find(x => x.name === 'email');
    expect(f.aliases).toContain('e-mail');
  });

  it('removes alias and writes file', async () => {
    await runAlias({ input: 'schema.json', field: 'phone', alias: 'mobile', remove: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    const f = written.fields.find(x => x.name === 'phone');
    expect(f.aliases).toBeUndefined();
  });

  it('lists aliases without writing', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runAlias({ input: 'schema.json', list: true });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('phone'));
    spy.mockRestore();
  });

  it('throws if field missing', async () => {
    await expect(runAlias({ input: 'schema.json', alias: 'x' })).rejects.toThrow('--field is required');
  });

  it('throws if alias missing', async () => {
    await expect(runAlias({ input: 'schema.json', field: 'email' })).rejects.toThrow('--alias is required');
  });
});
