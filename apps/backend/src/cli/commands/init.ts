import path from 'path';
import { generateDefaultConfig, parseArgs } from '../../config/loader';

/**
 * init command - generate default config file
 */
export function runInit(parsedArgs: ReturnType<typeof parseArgs>): void {
  // Check if there is a positional argument for output path
  let outputPath = path.resolve(process.cwd(), 'zpan.config.json');

  // Look for the first non-option argument as output path
  let foundOutput = false;
  let i = 2;
  while (i < process.argv.length) {
    const arg = process.argv[i];
    if (arg === 'init' || arg.startsWith('-')) {
      i++;
      continue;
    }
    if (!foundOutput) {
      outputPath = path.resolve(process.cwd(), arg);
      foundOutput = true;
      break;
    }
    i++;
  }

  const success = generateDefaultConfig(outputPath);
  process.exit(success ? 0 : 1);
}
