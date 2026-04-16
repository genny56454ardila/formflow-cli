const { resolveInputPath, runTag } = require('../../src/commands/tag');
const { loadSchema } = require('../../src/schema/loader');
const fs = require('fs');
const path = require('path');

jest.mock('../../src/schema/loader');
jest.mock('fs');

const mockSchema = {
  name: 'MyForm',
  fields: [
    { name: 'username', type: 'text', tags: ['required'] },
    { name: 'bio', type: 'textarea', tags: [] }
  ]
};

beforeEach(() => {
  loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(mockSchema)));
  fs.writeFileSync = jest.fn();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('resolveInputPath resolves relative paths', () => {
  const result = resolveInputPath('schema.json');
  expect(result).toBe(path.resolve(process.cwd(), 'schema.json'));
});

test('resolveInputPath keeps absolute paths', () => {
  const abs = '/tmp/schema.json';
  expect(resolveInputPath(abs)).toBe(abs);
});

test('runTag --list prints tags', async () => {
  await runTag('schema.json', { list: true });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('required'));
});

test('runTag --list with no tags prints message', async () => {
  loadSchema.mockResolvedValue({ name: 'Empty', fields: [] });
  await runTag('schema.json', { list: true });
  expect(console.log).toHaveBeenCalledWith('No tags found in schema.');
});

test('runTag --filter shows matching fields', async () => {
  await runTag('schema.json', { filter: 'required' });
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('username'));
});

test('runTag adds tag and writes file', async () => {
  await runTag('schema.json', { field: 'bio', tag: 'pii' });
  expect(fs.writeFileSync).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('pii'));
});

test('runTag --remove untags field', async () => {
  await runTag('schema.json', { field: 'username', tag: 'required', remove: true });
  expect(fs.writeFileSync).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Removed'));
});

test('runTag exits if --field missing', async () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(runTag('schema.json', { tag: 'pii' })).rejects.toThrow('exit');
  mockExit.mockRestore();
});
