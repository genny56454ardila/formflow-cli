const path = require('path');
const { resolveInputPath, runVersion } = require('../../src/commands/version');

jest.mock('../../src/schema/loader');
jest.mock('fs');

const { loadSchema } = require('../../src/schema/loader');
const fs = require('fs');

const mockSchema = { name: 'TestForm', fields: [], version: '1.0.0' };

beforeEach(() => {
  jest.clearAllMocks();
  loadSchema.mockResolvedValue({ ...mockSchema });
  fs.writeFileSync = jest.fn();
});

describe('resolveInputPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/tmp/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative paths against cwd', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runVersion', () => {
  const log = jest.fn();
  const error = jest.fn();

  it('bumps patch version by default', async () => {
    const code = await runVersion({ input: 'schema.json' }, { log, error });
    expect(code).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('1.0.0 → 1.0.1'));
  });

  it('bumps minor version when specified', async () => {
    const code = await runVersion({ input: 'schema.json', bump: 'minor' }, { log, error });
    expect(code).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('1.0.0 → 1.1.0'));
  });

  it('bumps major version when specified', async () => {
    const code = await runVersion({ input: 'schema.json', bump: 'major' }, { log, error });
    expect(code).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('1.0.0 → 2.0.0'));
  });

  it('sets explicit version with --set', async () => {
    const code = await runVersion({ input: 'schema.json', set: '5.0.0' }, { log, error });
    expect(code).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('1.0.0 → 5.0.0'));
  });

  it('writes to custom output path when provided', async () => {
    await runVersion({ input: 'schema.json', output: 'out.json' }, { log, error });
    const writtenPath = fs.writeFileSync.mock.calls[0][0];
    expect(writtenPath).toContain('out.json');
  });

  it('returns 1 and logs error when schema load fails', async () => {
    loadSchema.mockRejectedValue(new Error('File not found'));
    const code = await runVersion({ input: 'missing.json' }, { log, error });
    expect(code).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('File not found'));
  });

  it('returns 1 on invalid bump type', async () => {
    const code = await runVersion({ input: 'schema.json', bump: 'hotfix' }, { log, error });
    expect(code).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Version error'));
  });

  it('returns 1 on invalid --set value', async () => {
    const code = await runVersion({ input: 'schema.json', set: 'latest' }, { log, error });
    expect(code).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Version error'));
  });
});
