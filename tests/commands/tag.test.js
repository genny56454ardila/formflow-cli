const fs = require('fs');
const path = require('path');
const { resolveInputPath, runTag } = require('../../src/commands/tag');

jest.mock('../../src/schema/loader');
const { loadSchema } = require('../../src/schema/loader');

describe('resolveInputPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/tmp/schema.json';
    expect(resolveInputPath(abs)).toBe(abs);
  });

  it('resolves relative path', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runTag', () => {
  const schema = { title: 'Form', fields: [{ name: 'email', type: 'text' }] };

  beforeEach(() => {
    loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(schema)));
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('lists tags when --list is set', async () => {
    loadSchema.mockResolvedValue({ fields: [{ name: 'email', tags: ['pii'] }] });
    await runTag({ input: 'schema.json', list: true });
    expect(console.log).toHaveBeenCalledWith('Tags:', 'pii');
  });

  it('prints no tags message when schema has no tags', async () => {
    await runTag({ input: 'schema.json', list: true });
    expect(console.log).toHaveBeenCalledWith('No tags found in schema.');
  });

  it('adds tags to a field and writes output', async () => {
    await runTag({ input: 'schema.json', field: 'email', add: ['pii'], output: '/tmp/out.json' });
    expect(fs.writeFileSync).toHaveBeenCalled();
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written.fields[0].tags).toContain('pii');
  });

  it('exits with error when field is missing for add', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runTag({ input: 'schema.json', add: ['pii'] })).rejects.toThrow('exit');
    exitSpy.mockRestore();
  });
});
