const fs = require('fs');
const path = require('path');

/**
 * Marks a schema as published with a timestamp and optional channel.
 */
function publishSchema(schema, channel = 'default') {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema: must be a non-null object');
  }
  return {
    ...schema,
    published: true,
    publishedAt: new Date().toISOString(),
    publishChannel: channel,
  };
}

/**
 * Unpublishes a schema by removing publication metadata.
 */
function unpublishSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema: must be a non-null object');
  }
  const result = { ...schema };
  delete result.published;
  delete result.publishedAt;
  delete result.publishChannel;
  return result;
}

/**
 * Returns true if the schema is currently published.
 */
function isPublished(schema) {
  return schema != null && schema.published === true;
}

/**
 * Lists all published schemas from a directory of JSON files.
 */
function listPublished(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        return { file: f, schema: data };
      } catch {
        return null;
      }
    })
    .filter(entry => entry && isPublished(entry.schema));
}

module.exports = { publishSchema, unpublishSchema, isPublished, listPublished };
