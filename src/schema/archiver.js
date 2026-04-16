const fs = require('fs');
const path = require('path');

/**
 * Archive a schema by storing it with a timestamp and optional label.
 */
function archiveSchema(schema, archiveDir, label = '') {
  if (!schema || !schema.fields) {
    throw new Error('Invalid schema: missing fields');
  }

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const slug = label ? `_${label.replace(/\s+/g, '-')}` : '';
  const filename = `archive_${timestamp}${slug}.json`;
  const filepath = path.join(archiveDir, filename);

  const entry = {
    archivedAt: new Date().toISOString(),
    label: label || null,
    schema,
  };

  fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
  return filepath;
}

/**
 * List all archived schemas in the archive directory.
 */
function listArchives(archiveDir) {
  if (!fs.existsSync(archiveDir)) return [];

  return fs
    .readdirSync(archiveDir)
    .filter((f) => f.startsWith('archive_') && f.endsWith('.json'))
    .map((f) => {
      const filepath = path.join(archiveDir, f);
      const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      return { filename: f, archivedAt: raw.archivedAt, label: raw.label };
    })
    .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
}

/**
 * Load a specific archive by filename.
 */
function loadArchive(archiveDir, filename) {
  const filepath = path.join(archiveDir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Archive not found: ${filename}`);
  }
  const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  return raw.schema;
}

module.exports = { archiveSchema, listArchives, loadArchive };
