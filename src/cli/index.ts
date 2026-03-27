#!/usr/bin/env node
import { parseArgs, printHelp, printVersion } from '../config/loader';
import { runInit } from './commands/init';
import { runStart } from './commands/start';

/**
 * Main CLI entry point
 */
function main(): void {
  const parsed = parseArgs();

  if (parsed.init) {
    runInit(parsed);
    return;
  }

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  if (parsed.version) {
    printVersion();
    process.exit(0);
  }

  // Default is start command
  runStart().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

main();
