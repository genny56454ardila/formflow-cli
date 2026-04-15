const { resolveInputPath, printDiff, runDiff } = require('../../src/commands/diff');
const { diffSchemaFiles } = require('../../src/schema/differ');
const path = require('path');

jest.mock('../../src/schema/differ');

describe('resolveInputPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/tmp/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative path against cwd', () => {
    const result = resolveInputPath('schemas/form.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schemas/form.json'));
  });
});

describe('printDiff', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints no changes message when hasChanges is false', () => {
    printDiff({ hasChanges: false, added: [], removed: [], modified: [] });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No differences'));
  });

  it('prints added fields', () => {
    printDiff({
      hasChanges: true,
      added: [{ name: 'phone', type: 'tel' }],
      removed: [],
      modified: []
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Added fields'));
  });

  it('prints removed fields', () => {
    printDiff({
      hasChanges: true,
      added: [],
      removed: [{ name: 'fax', type: 'text' }],
      modified: []
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Removed fields'));
  });

  it('prints modified fields', () => {
    printDiff({
      hasChanges: true,
      added: [],
      removed: [],
      modified: [{ name: 'email', changes: { required: { from: false, to: true } } }]
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Modified fields'));
  });
});

describe('runDiff', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls diffSchemaFiles with resolved paths', async () => {
    diffSchemaFiles.mockResolvedValue({ hasChanges: false, added: [], removed: [], modified: [] });
    await runDiff('a.json', 'b.json');
    expect(diffSchemaFiles).toHaveBeenCalledWith(
      path.resolve(process.cwd(), 'a.json'),
      path.resolve(process.cwd(), 'b.json')
    );
  });

  it('handles errors gracefully', async () => {
    diffSchemaFiles.mockRejectedValue(new Error('File not found'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await runDiff('missing.json', 'also-missing.json');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
