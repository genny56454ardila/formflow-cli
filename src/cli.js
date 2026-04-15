#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { runExport } = require('./commands/export');
const { runValidate } = require('./commands/validate');
const { runScaffold } = require('./commands/scaffold');
const { version } = require('../package.json');

program
  .name('formflow')
  .description('Scaffold and validate web form schemas from JSON config files')
  .version(version);

program
  .command('validate <schema>')
  .description('Validate a form schema JSON file')
  .option('-v, --verbose', 'print full schema on success')
  .option('-q, --quiet', 'suppress all output')
  .action(async (schema, options) => {
    try {
      const { valid } = await runValidate(schema, options);
      process.exitCode = valid ? 0 : 1;
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  });

program
  .command('scaffold <id> [output]')
  .description('Generate a new form schema JSON file')
  .option('-f, --fields <fields...>', 'field definitions in name:type format')
  .option('--overwrite', 'overwrite output file if it already exists')
  .option('-q, --quiet', 'suppress all output')
  .action(async (id, output, options) => {
    try {
      await runScaffold(id, output, options);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  });

program
  .command('export <schema> [output]')
  .description('Export a form schema to HTML, Markdown, or JSON')
  .option('-f, --format <format>', 'output format: json | html | markdown', 'json')
  .option('-q, --quiet', 'suppress all output')
  .action(async (schema, output, options) => {
    try {
      const VALID_FORMATS = ['json', 'html', 'markdown'];
      if (!VALID_FORMATS.includes(options.format)) {
        console.error(`Error: Invalid format "${options.format}". Must be one of: ${VALID_FORMATS.join(', ')}`);
        process.exitCode = 1;
        return;
      }
      await runExport(schema, output, options);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
