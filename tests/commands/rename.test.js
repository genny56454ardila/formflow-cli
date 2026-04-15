const fs = require('fs');
const path = require('path');
const { resolveInputPath, parseNameMap, runRename } = require('../../src/commands/rename');

jest.mock('fs');
jest.mock('../../src/schema/loader');
const { loadSchema } = require('../../src/schema/loader');

const mockSchema = {
  name: 'TestForm',
  fields: [
    { name: 'firstName', label: 'firstName', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  fs.writeFileSync.mockImplementation(() => {});
  loadSchema.mockReturnValue(mockSchema);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
});

describe('resolveInputPath', () => {
  it('resolves a valid path', () => {
    const result = resolveInputPath('form.json');
    expect(result).toContain('form.json');
  });

  it('throws when no path given', () => {
    expect(() => resolveInputPath()).toThrow('Input path is required');
  });

  it('throws when file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => resolveInputPath('missing.json')).toThrow('File not found');
  });
});

describe('parseNameMap', () => {
  it('parses valid pairs', () => {
    const map = parseNameMap(['firstName:first_name', 'email:emailAddress']);
    expect(map).toEqual({ firstName: 'first_name', email: 'emailAddress' });
  });

  it('throws on empty pairs', () => {
    expect(() => parseNameMap([])).toThrow('At least one rename pair');
  });

  it('throws on malformed pair', () => {
    expect(() => parseNameMap(['badformat'])).toThrow('Invalid rename pair format');
  });

  it('trims whitespace from keys and values', () => {
    const map = parseNameMap([' foo : bar ']);
    expect(map).toEqual({ foo: 'bar' });
  });
});

describe('runRename', () => {
  it('prints output to stdout when no output option', async () => {
    await runRename('form.json', ['firstName:first_name']);
    expect(console.log).toHaveBeenCalled();
  });

  it('writes to file when output option provided', async () => {
    await runRename('form.json', ['firstName:first_name'], { output: 'out.json' });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('written to'));
  });

  it('warns about conflicts', async () => {
    await runRename('form.json', ['firstName:email']);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('conflicts'));
  });

  it('returns renamed schema and conflicts', async () => {
    const result = await runRename('form.json', ['firstName:first_name']);
    expect(result).toHaveProperty('renamed');
    expect(result).toHaveProperty('conflicts');
  });
});
