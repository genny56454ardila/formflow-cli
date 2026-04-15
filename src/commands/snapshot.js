const path = require('path');
const chalk = require('chalk');
const { loadSchema } = require('../schema/loader');
const { saveSnapshot, loadSnapshot, listSnapshots, DEFAULT_SNAPSHOT_DIR } = require('../schema/snapshotter');
const { diffSchemas } = require('../schema/differ');
const { printDiff } = require('./diff');

function resolveInputPath(inputArg) {
  if (!inputArg) throw new Error('Input path is required');
  return path.resolve(process.cwd(), inputArg);
}

async function runSnapshot(action, options = {}) {
  const snapshotDir = options.dir
    ? path.resolve(process.cwd(), options.dir)
    : path.join(process.cwd(), DEFAULT_SNAPSHOT_DIR);

  if (action === 'save') {
    const inputPath = resolveInputPath(options.input);
    const schema = await loadSchema(inputPath);
    const label = options.label || path.basename(inputPath, path.extname(inputPath));
    const saved = saveSnapshot(schema, label, snapshotDir);
    console.log(chalk.green('✔ Snapshot saved:'), chalk.cyan(saved));
    return saved;
  }

  if (action === 'list') {
    const snaps = listSnapshots(snapshotDir);
    if (snaps.length === 0) {
      console.log(chalk.yellow('No snapshots found in'), chalk.cyan(snapshotDir));
    } else {
      console.log(chalk.bold('Snapshots:'));
      snaps.forEach((s) => console.log(' ', chalk.cyan(path.basename(s))));
    }
    return snaps;
  }

  if (action === 'compare') {
    const inputPath = resolveInputPath(options.input);
    const currentSchema = await loadSchema(inputPath);
    const snaps = listSnapshots(snapshotDir);
    if (snaps.length === 0) throw new Error('No snapshots available to compare against');
    const snapPath = options.snapshot ? path.resolve(process.cwd(), options.snapshot) : snaps[0];
    const { schema: snapSchema, label, savedAt } = loadSnapshot(snapPath);
    console.log(chalk.bold('Comparing against snapshot:'), chalk.cyan(label), chalk.gray(`(${savedAt})`));
    const diffs = diffSchemas(snapSchema, currentSchema);
    if (diffs.length === 0) {
      console.log(chalk.green('✔ No differences found.'));
    } else {
      printDiff(diffs);
    }
    return diffs;
  }

  throw new Error(`Unknown snapshot action: ${action}`);
}

module.exports = { resolveInputPath, runSnapshot };
