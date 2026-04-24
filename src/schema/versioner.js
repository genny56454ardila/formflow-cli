// versioner.js — manage semantic version metadata on schemas

/**
 * Bump the version of a schema (major, minor, or patch).
 * @param {object} schema
 * @param {'major'|'minor'|'patch'} releaseType
 * @returns {object} updated schema
 */
function bumpVersion(schema, releaseType = 'patch') {
  const current = schema.version || '0.0.0';
  const parts = current.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: "${current}"`);
  }
  const [major, minor, patch] = parts;
  switch (releaseType) {
    case 'major': return { ...schema, version: `${major + 1}.0.0` };
    case 'minor': return { ...schema, version: `${major}.${minor + 1}.0` };
    case 'patch': return { ...schema, version: `${major}.${minor}.${patch + 1}` };
    default: throw new Error(`Unknown release type: "${releaseType}"`);
  }
}

/**
 * Set an explicit version string on a schema.
 * @param {object} schema
 * @param {string} version  semver string e.g. "2.1.0"
 * @returns {object} updated schema
 */
function setVersion(schema, version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid semver string: "${version}"`);
  }
  return { ...schema, version };
}

/**
 * Read the current version from a schema (defaults to '0.0.0').
 * @param {object} schema
 * @returns {string}
 */
function getVersion(schema) {
  return schema.version || '0.0.0';
}

/**
 * Compare two semver strings.
 * @returns {-1|0|1}
 */
function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

module.exports = { bumpVersion, setVersion, getVersion, compareVersions };
