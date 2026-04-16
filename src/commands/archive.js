const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { archiveSchema, listArchives, loadArchive } = require('../schema/archiver');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runArchive(argv) {
  const { input, dir = '.formflow/archives', label = '', list, restore } = argv;
  const archiveDir = path.resolve(process.cwd(), dir);

  if (list) {
    const archives = listArchives(archiveDir);
    if (archives.length === 0) {
      console.log('No archives found.');
    } else {
      archives.forEach(({ filename, archivedAt, label: lbl }) => {
        console.log(`- ${filename}  [${archivedAt}]${lbl ? '  "' + lbl + '"' : ''}`);
      });
    }
    return;
  }

  if (restore) {
    const schema = loadArchive(archiveDir, restore);
    const outPath = input ? resolveInputPath(input) : path.join(process.cwd(), 'restored-schema.json');
    fs.writeFileSync(outPath, JSON.stringify(schema, null, 2));
    console.log(`Schema restored to ${outPath}`);
    return;
  }

  if (!input) {
    console.error('Error: --input is required to archive a schema.');
    process.exit(1);
  }

  const inputPath = resolveInputPath(input);
  const schema = loadSchema(inputPath);
  const filepath = archiveSchema(schema, archiveDir, label);
  console.log(`Schema archived to ${filepath}`);
}

module.exports = { resolveInputPath, runArchive };
