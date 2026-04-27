/**
 * embed.js — CLI command to embed $ref fields inline in a schema file
 */

const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { embedSchema, listEmbedded } = require('../schema/embedder');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runEmbed(args, opts = {}) {
  const { input, refs: refsArg, output, list } = opts;

  if (!input) {
    console.error('Error: --input is required');
    process.exit(1);
  }

  const inputPath = resolveInputPath(input);
  let schema;
  try {
    schema = loadSchema(inputPath);
  } catch (err) {
    console.error(`Error loading schema: ${err.message}`);
    process.exit(1);
  }

  if (list) {
    const { listEmbedded: le } = require('../schema/embedder');
    const embedded = le(schema);
    if (embedded.length === 0) {
      console.log('No embedded fields found.');
    } else {
      console.log(`Embedded fields (${embedded.length}):`);
      embedded.forEach((f) => console.log(`  - ${f.name} (from: ${f.embeddedFrom})`));
    }
    return;
  }

  if (!refsArg) {
    console.error('Error: --refs is required for embedding');
    process.exit(1);
  }

  const refsPath = resolveInputPath(refsArg);
  let refMap;
  try {
    refMap = JSON.parse(fs.readFileSync(refsPath, 'utf8'));
  } catch (err) {
    console.error(`Error loading refs file: ${err.message}`);
    process.exit(1);
  }

  let result;
  try {
    result = embedSchema(schema, refMap);
  } catch (err) {
    console.error(`Embed error: ${err.message}`);
    process.exit(1);
  }

  const outputPath = output ? resolveInputPath(output) : inputPath;
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Embedded schema written to ${outputPath}`);
}

module.exports = { resolveInputPath, runEmbed };
