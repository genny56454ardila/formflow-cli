const fs = require('fs');
const path = require('path');
const { resolveInputPath, runMap } = require('../../src/commands/map');

jest.mock('../../src/schema/loader');
jest.mock('fs');

const { loadSchema } = require('../../src/schema/loader');

describe('resolveInputPath', () => {
  it('resolves relative path against cwd', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });
});

describe('runMap', () => {
  const mockSchema = {
    name: 'MyForm',
    fields: [
      { name: 'first', type: 'text', label: 'First' },
      { name: 'last', type: 'text', label: 'Last' },
    ],
  };

  const mockMappings = [{ from: 'first', to: 'firstName' }];

  beforeEach(() => {
    jest.clearAllMocks();
    loadSchema.mockResolvedValue(mockSchema);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockMappings));
    fs.writeFileSync.mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it('maps schema fields and prints to stdout when no output option', async () => {
    const result = await runMap('schema.json', 'mappings.json');
    expect(result.fields[0].name).toBe('firstName');
    expect(result.fields[1].name).toBe('last');
    expect(console.log).toHaveBeenCalled();
  });

  it('writes to output file when output option provided', async () => {
    await runMap('schema.json', 'mappings.json', { output: 'out.json' });
    expect(fs.writeFileSync).toHaveBeenCalled();
    const [writePath] = fs.writeFileSync.mock.calls[0];
    expect(writePath).toContain('out.json');
  });

  it('throws if mappings file cannot be parsed', async () => {
    fs.readFileSync.mockReturnValue('not json');
    await expect(runMap('schema.json', 'mappings.json')).rejects.toThrow('Failed to load mappings file');
  });

  it('throws if mappings is not an array', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ from: 'a', to: 'b' }));
    await expect(runMap('schema.json', 'mappings.json')).rejects.toThrow('Mappings file must contain a JSON array');
  });
});
