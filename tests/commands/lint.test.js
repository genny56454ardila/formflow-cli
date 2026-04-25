const { resolveInputPath, runLint } = require('../../src/commands/lint');
const { loadSchema } = require('../../src/schema/loader');
const { lintSchema } = require('../../src/schema/linter');

jest.mock('../../src/schema/loader');
jest.mock('../../src/schema/linter');

describe('resolveInputPath', () => {
  it('throws when no input is provided', () => {
    expect(() => resolveInputPath(undefined)).toThrow('Input path is required.');
  });

  it('returns absolute path unchanged', () => {
    const abs = '/tmp/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative path against cwd', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(require('path').resolve(process.cwd(), 'schema.json'));
  });
});

describe('runLint', () => {
  let consoleSpy, warnSpy, errorSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = 0;
  });

  afterEach(() => jest.restoreAllMocks());

  it('logs success when no warnings', async () => {
    loadSchema.mockResolvedValue({ fields: [] });
    lintSchema.mockReturnValue([]);
    await runLint('/fake/schema.json');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No lint warnings'));
    expect(process.exitCode).toBe(0);
  });

  it('prints warnings in default format', async () => {
    loadSchema.mockResolvedValue({ fields: [] });
    lintSchema.mockReturnValue([{ rule: 'MISSING_LABEL', field: 'x', message: 'Field "x" is missing a label.' }]);
    await runLint('/fake/schema.json');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('sets exitCode to 1 in strict mode with warnings', async () => {
    loadSchema.mockResolvedValue({ fields: [] });
    lintSchema.mockReturnValue([{ rule: 'MISSING_LABEL', field: 'x', message: 'Field "x" is missing a label.' }]);
    await runLint('/fake/schema.json', { strict: true });
    expect(process.exitCode).toBe(1);
  });

  it('does not set exitCode to 1 in non-strict mode with warnings', async () => {
    loadSchema.mockResolvedValue({ fields: [] });
    lintSchema.mockReturnValue([{ rule: 'MISSING_LABEL', field: 'x', message: 'Field "x" is missing a label.' }]);
    await runLint('/fake/schema.json', { strict: false });
    expect(process.exitCode).toBe(0);
  });

  it('outputs JSON when format option is json', async () => {
    loadSchema.mockResolvedValue({ fields: [] });
    const warnings = [{ rule: 'MISSING_LABEL', field: 'x', message: 'Field "x" is missing a label.' }];
    lintSchema.mockReturnValue(warnings);
    await runLint('/fake/schema.json', { format: 'json' });
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(warnings, null, 2));
  });

  it('sets exitCode to 1 when schema fails to load', async () => {
    loadSchema.mockRejectedValue(new Error('file not found'));
    await runLint('/fake/schema.json');
    expect(process.exitCode).toBe(1);
  });

  it('logs the error message when schema fails to load', async () => {
    loadSchema.mockRejectedValue(new Error('file not found'));
    await runLint('/fake/schema.json');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('file not found'));
  });
});
