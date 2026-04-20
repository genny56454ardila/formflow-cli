const fs = require('fs');
const path = require('path');
const { resolveInputPath, runLink } = require('../../src/commands/link');

jest.mock('fs');
jest.mock('../../src/schema/loader');
jest.mock('../../src/schema/linker');

const { loadSchema } = require('../../src/schema/loader');
const {
  linkFieldInSchema,
  unlinkFieldInSchema,
  listLinks,
} = require('../../src/schema/linker');

const mockSchema = {
  name: 'address',
  fields: [
    { name: 'country', type: 'select' },
    { name: 'city', type: 'text' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  fs.writeFileSync.mockImplementation(() => {});
  loadSchema.mockReturnValue(mockSchema);
  linkFieldInSchema.mockReturnValue(mockSchema);
  unlinkFieldInSchema.mockReturnValue(mockSchema);
  listLinks.mockReturnValue([]);
});

describe('resolveInputPath', () => {
  it('returns resolved path when file exists', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toContain('schema.json');
  });

  it('throws when file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => resolveInputPath('missing.json')).toThrow('Schema file not found');
  });
});

describe('runLink', () => {
  it('lists links when --list is passed', async () => {
    listLinks.mockReturnValue([{ field: 'city', linkedTo: ['country'] }]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runLink({ input: 'schema.json', list: true });
    expect(listLinks).toHaveBeenCalledWith(mockSchema);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('city'));
    spy.mockRestore();
  });

  it('prints message when no links exist', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runLink({ input: 'schema.json', list: true });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No field links'));
    spy.mockRestore();
  });

  it('calls linkFieldInSchema with correct args', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await runLink({ input: 'schema.json', field: 'city', targets: 'country,state' });
    expect(linkFieldInSchema).toHaveBeenCalledWith(mockSchema, 'city', ['country', 'state']);
  });

  it('calls unlinkFieldInSchema when --unlink is set', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await runLink({ input: 'schema.json', field: 'city', targets: 'country', unlink: true });
    expect(unlinkFieldInSchema).toHaveBeenCalledWith(mockSchema, 'city', 'country');
  });

  it('throws when --field is missing', async () => {
    await expect(runLink({ input: 'schema.json' })).rejects.toThrow('--field is required');
  });

  it('throws when --targets is empty and not unlinking', async () => {
    await expect(
      runLink({ input: 'schema.json', field: 'city', targets: '' })
    ).rejects.toThrow('--targets must specify');
  });

  it('writes output to a custom path when --output is provided', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await runLink({ input: 'schema.json', field: 'city', targets: 'country', output: 'out.json' });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('out.json'),
      expect.any(String)
    );
  });
});
