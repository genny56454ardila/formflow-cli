const fs = require('fs');
const path = require('path');

const DEFAULT_SNAPSHOT_DIR = '.formflow-snapshots';

/**
 * Save a schema snapshot to disk with a timestamp label.
 * @param {object} schema
 * @param {string} label - human-readable name for the snapshot
 * @param {string} snapshotDir
 * @returns {string} - path of the written snapshot file
 */
function saveSnapshot(schema, label, snapshotDir = DEFAULT_SNAPSHOT_DIR) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema: must be a non-null object');
  }
  if (!label || typeof label !== 'string' || !label.trim()) {
    throw new Error('Invalid label: must be a non-empty string');
  }

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = label.trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  const filename = `${safeName}_${timestamp}.json`;
  const filePath = path.join(snapshotDir, filename);

  const payload = { label: label.trim(), savedAt: new Date().toISOString(), schema };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}

/**
 * Load a snapshot file from disk.
 * @param {string} filePath
 * @returns {{ label: string, savedAt: string, schema: object }}
 */
function loadSnapshot(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed.schema || !parsed.savedAt) {
    throw new Error('Invalid snapshot format');
  }
  return parsed;
}

/**
 * List all snapshots in a directory, sorted by modification time descending.
 * @param {string} snapshotDir
 * @returns {string[]}
 */
function listSnapshots(snapshotDir = DEFAULT_SNAPSHOT_DIR) {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(snapshotDir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
}

module.exports = { saveSnapshot, loadSnapshot, listSnapshots, DEFAULT_SNAPSHOT_DIR };
