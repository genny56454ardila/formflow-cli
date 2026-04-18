const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { splitSchema, splitSchemaByGroup } = require('../schema/splitter');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runSplit(inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const schema = await loadSchema(inputPath);

  if (options.byGroup) {
    const groups = splitSchemaByGroup(schema);
    const outDir = options.outDir || path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    for (const [group, groupSchema] of Object.entries(groups)) {
      const outPath = path.join(outDir, `${base}.${group}.json`);
      fs.writeFileSync(outPath, JSON.stringify(groupSchema, null, 2));
      console.log(`Written: ${outPath}`);
    }
    return groups;
  }

  const field = options.field;
  const value = options.value;
  if (!field || value === undefined) {
    throw new Error('Provide --field and --value to split by a field property, or use --by-group');
  }

  const [matched, rest] = splitSchema(schema, f => String(f[field]) === String(value));
  const outDir = options.outDir || path.dirname(inputPath);
  const base = path.basename(inputPath, path.extname(inputPath));

  const matchedPath = path.join(outDir, `${base}.matched.json`);
  const restPath = path.join(outDir, `${base}.rest.json`);

  fs.writeFileSync(matchedPath, JSON.stringify(matched, null, 2));
  fs.writeFileSync(restPath, JSON.stringify(rest, null, 2));

  console.log(`Matched: ${matchedPath}`);
  console.log(`Rest:    ${restPath}`);

  return { matched, rest };
}

module.exports = { resolveInputPath, runSplit };
