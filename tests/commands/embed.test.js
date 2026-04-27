const fs = require('fs');
const path = require('path');
const { resolveInputPath, runEmbed } = require('../../src/commands/embed');

jest.mock('fs');
jest.mock('../../src/schema/loader');
const { loadSchema } = require('../../src/schema/loader');

describe('resolveInputPath', () => {
  it('resolves relative path against cwd', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runEmbed', () => {
  let exitSpy, errorSpy, logSpy;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exits if --input is missing', async () => {
    await expect(runEmbed([], {})).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('--input is required'));
  });

  it('exits if schema fails to load', async () => {
    loadSchema.mockImplementation(() => { throw new Error('not found'); });
    await expect(runEmbed([], { input: 'bad.json', refs: 'refs.json' })).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error loading schema'));
  });

  it('exits if --refs is missing and not listing', async () => {
    loadSchema.mockReturnValue({ fields: [] });
    await expect(runEmbed([], { input: 'schema.json' })).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('--refs is required'));
  });

  it('lists embedded fields when --list is set', async () => {
    loadSchema.mockReturnValue({
      fields: [{ name: 'email', embedded: true, embeddedFrom: '#/defs/email' }],
    });
    await runEmbed([], { input: 'schema.json', list: true });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Embedded fields'));
  });

  it('writes embedded schema to output path', async () => {
    const schema = { fields: [{ name: 'email', $ref: '#/defs/email' }] };
    const refMap = { '#/defs/email': { type: 'email', label: 'Email' } };
    loadSchema.mockReturnValue(schema);
    fs.readFileSync.mockReturnValue(JSON.stringify(refMap));
    fs.writeFileSync.mockImplementation(() => {});
    await runEmbed([], { input: 'schema.json', refs: 'refs.json', output: 'out.json' });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('written to'));
  });

  it('exits if refs file fails to parse', async () => {
    loadSchema.mockReturnValue({ fields: [] });
    fs.readFileSync.mockImplementation(() => { throw new Error('no file'); });
    await expect(runEmbed([], { input: 'schema.json', refs: 'refs.json' })).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error loading refs file'));
  });
});
