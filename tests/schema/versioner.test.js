const { bumpVersion, setVersion, getVersion, compareVersions } = require('../../src/schema/versioner');

const baseSchema = { name: 'UserForm', fields: [], version: '1.2.3' };

describe('getVersion', () => {
  it('returns the version property', () => {
    expect(getVersion(baseSchema)).toBe('1.2.3');
  });

  it('defaults to 0.0.0 when version is absent', () => {
    expect(getVersion({ name: 'X', fields: [] })).toBe('0.0.0');
  });
});

describe('bumpVersion', () => {
  it('bumps patch by default', () => {
    expect(bumpVersion(baseSchema).version).toBe('1.2.4');
  });

  it('bumps minor and resets patch', () => {
    expect(bumpVersion(baseSchema, 'minor').version).toBe('1.3.0');
  });

  it('bumps major and resets minor + patch', () => {
    expect(bumpVersion(baseSchema, 'major').version).toBe('2.0.0');
  });

  it('starts from 0.0.0 if no version present', () => {
    const s = { name: 'X', fields: [] };
    expect(bumpVersion(s).version).toBe('0.0.1');
  });

  it('does not mutate the original schema', () => {
    const original = { ...baseSchema };
    bumpVersion(original, 'major');
    expect(original.version).toBe('1.2.3');
  });

  it('throws on unknown release type', () => {
    expect(() => bumpVersion(baseSchema, 'hotfix')).toThrow('Unknown release type');
  });

  it('throws on malformed version string', () => {
    expect(() => bumpVersion({ ...baseSchema, version: 'v1.0' })).toThrow('Invalid version format');
  });
});

describe('setVersion', () => {
  it('sets a valid semver string', () => {
    expect(setVersion(baseSchema, '3.0.0').version).toBe('3.0.0');
  });

  it('throws on non-semver input', () => {
    expect(() => setVersion(baseSchema, 'latest')).toThrow('Invalid semver string');
  });

  it('does not mutate the original schema', () => {
    setVersion(baseSchema, '9.9.9');
    expect(baseSchema.version).toBe('1.2.3');
  });
});

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
  });

  it('returns 1 when first is greater', () => {
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
  });

  it('returns -1 when first is lesser', () => {
    expect(compareVersions('0.9.0', '1.0.0')).toBe(-1);
  });

  it('compares minor correctly', () => {
    expect(compareVersions('1.3.0', '1.2.9')).toBe(1);
  });
});
