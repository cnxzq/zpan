#!/usr/bin/env node
import { parseArgs, printHelp, printVersion } from '../config/loader';

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const parsed = parseArgs();

  // Enable debug logging if --debug flag is present
  // Must set DEBUG before importing any modules that use debug
  if (parsed.debug && !process.env.DEBUG) {
    process.env.DEBUG = 'zpan:*';
  }

  // Dynamic import after setting DEBUG environment variable
  const { runInit } = await import('./commands/init');
  const { runStart } = await import('./commands/start');

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
