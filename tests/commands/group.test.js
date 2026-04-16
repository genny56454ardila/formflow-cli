const { resolveInputPath, runGroup } = require('../../src/commands/group');
const { loadSchema } = require('../../src/schema/loader');
const path = require('path');

jest.mock('../../src/schema/loader');

const mockSchema = {
  name: 'testForm',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'age', type: 'number' },
    { name: 'name', type: 'text' },
  ],
};

beforeEach(() => {
  loadSchema.mockResolvedValue(mockSchema);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('resolveInputPath', () => {
  it('resolves relative path', () => {
    const result = resolveInputPath('schema.json');
    expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
  });

  it('throws if no input provided', () => {
    expect(() => resolveInputPath()).toThrow('Input path is required');
  });
});

describe('runGroup', () => {
  it('groups by type by default', async () => {
    const result = await runGroup('schema.json');
    expect(result.text).toHaveLength(2);
    expect(result.number).toHaveLength(1);
  });

  it('groups by custom key', async () => {
    loadSchema.mockResolvedValue({
      name: 'f',
      fields: [
        { name: 'a', type: 'text', section: 'personal' },
        { name: 'b', type: 'text', section: 'contact' },
      ],
    });
    const result = await runGroup('schema.json', { by: 'section' });
    expect(result.personal).toHaveLength(1);
    expect(result.contact).toHaveLength(1);
  });

  it('outputs json when --json flag set', async () => {
    const result = await runGroup('schema.json', { json: true });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('text'));
    expect(result).toBeDefined();
  });
});
