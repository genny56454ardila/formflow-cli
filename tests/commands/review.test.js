const fs = require('fs');
const path = require('path');
const { runReview, resolveInputPath } = require('../../src/commands/review');

jest.mock('../../src/schema/loader');
const { loadSchema } = require('../../src/schema/loader');

const mockSchema = {
  name: 'contact',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' }
  ]
};

beforeEach(() => {
  loadSchema.mockResolvedValue(JSON.parse(JSON.stringify(mockSchema)));
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('resolveInputPath', () => {
  it('resolves to an absolute path', () => {
    const result = resolveInputPath('schema.json');
    expect(path.isAbsolute(result)).toBe(true);
  });
});

describe('runReview - add', () => {
  it('adds a review and writes the file', async () => {
    const result = await runReview('add', 'schema.json', {
      field: 'email',
      reviewer: 'alice',
      comment: 'Looks good',
      status: 'approved'
    });
    const emailField = result.fields.find(f => f.name === 'email');
    expect(emailField.reviews).toHaveLength(1);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('throws if required options are missing', async () => {
    await expect(runReview('add', 'schema.json', { field: 'email' }))
      .rejects.toThrow('--field, --reviewer, and --comment are required');
  });
});

describe('runReview - remove', () => {
  it('removes a review and writes the file', async () => {
    loadSchema.mockResolvedValue({
      name: 'contact',
      fields: [
        { name: 'email', type: 'text', reviews: [{ reviewer: 'alice', comment: 'ok', status: 'approved', timestamp: '' }] }
      ]
    });
    const result = await runReview('remove', 'schema.json', { field: 'email', reviewer: 'alice' });
    const emailField = result.fields.find(f => f.name === 'email');
    expect(emailField.reviews).toBeUndefined();
  });

  it('throws if required options are missing', async () => {
    await expect(runReview('remove', 'schema.json', { field: 'email' }))
      .rejects.toThrow('--field and --reviewer are required');
  });
});

describe('runReview - list', () => {
  it('prints no reviews message when none exist', async () => {
    await runReview('list', 'schema.json');
    expect(console.log).toHaveBeenCalledWith('No reviews found.');
  });

  it('returns reviews map', async () => {
    loadSchema.mockResolvedValue({
      name: 'contact',
      fields: [
        { name: 'email', type: 'text', reviews: [{ reviewer: 'alice', comment: 'ok', status: 'approved', timestamp: '' }] }
      ]
    });
    const result = await runReview('list', 'schema.json');
    expect(result).toHaveProperty('email');
  });
});

describe('runReview - summary', () => {
  it('returns summary counts', async () => {
    loadSchema.mockResolvedValue({
      name: 'contact',
      fields: [
        { name: 'email', type: 'text', reviews: [{ reviewer: 'alice', comment: 'ok', status: 'approved', timestamp: '' }] }
      ]
    });
    const result = await runReview('summary', 'schema.json');
    expect(result.total).toBe(1);
    expect(result.approved).toBe(1);
  });
});

describe('runReview - unknown action', () => {
  it('throws on unknown action', async () => {
    await expect(runReview('unknown', 'schema.json')).rejects.toThrow('Unknown action');
  });
});
