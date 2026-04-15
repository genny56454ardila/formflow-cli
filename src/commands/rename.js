const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { renameSchema } = require('../schema/renamer');
const { formatErrors } = require('../schema/formatter');

const resolveInputPath = (inputArg) => {
  if (!inputArg) throw new Error('Input path is required');
  const resolved = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);
  return resolved;
};

const parseNameMap = (pairs) => {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('At least one rename pair (old:new) is required');
  }
  const map = {};
  for (const pair of pairs) {
    const parts = pair.split(':');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      throw new Error(`Invalid rename pair format: "${pair}" — expected old:new`);
    }
    map[parts[0].trim()] = parts[1].trim();
  }
  return map;
};

const runRename = async (inputArg, pairs, options = {}) => {
  const inputPath = resolveInputPath(inputArg);
  const schema = loadSchema(inputPath);
  const nameMap = parseNameMap(pairs);

  const { schema: renamed, conflicts, renamedCount } = renameSchema(schema, nameMap);

  if (conflicts.length > 0) {
    console.warn('⚠️  Rename conflicts detected (fields skipped):');
    for (const c of conflicts) {
      console.warn(`   "${c.from}" → "${c.to}" conflicts with an existing field`);
    }
  }

  const output = JSON.stringify(renamed, null, 2);

  if (options.output) {
    const outPath = path.resolve(process.cwd(), options.output);
    fs.writeFileSync(outPath, output, 'utf-8');
    console.log(`✅ Renamed schema written to ${outPath} (${renamedCount} field(s) renamed)`);
  } else {
    console.log(output);
  }

  return { renamed, conflicts };
};

module.exports = { resolveInputPath, parseNameMap, runRename };
