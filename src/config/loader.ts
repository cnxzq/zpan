import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ZpanConfig, JsonConfig } from './schema';
import packageJson from '../../package.json';

/**
 * Result of parsing CLI arguments
 */
export interface CliParseResult {
  configPath: string | null;
  init: boolean;
  help: boolean;
  version: boolean;
  // All config options can be overridden via CLI
  name: string | null;
  port: string | null;
  host: string | null;
  staticRoot: string | null;
  username: string | null;
  password: string | null;
  realm: string | null;
  maxFileSize: string | null;
  sessionSecret: string | null;
  sessionName: string | null;
}

/**
 * Parse size string like '10GB', '100MB', '1gb' to bytes
 */
function parseSizeToBytes(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb|tb|k|m|g|t)$/i);
  if (!match) {
    return parseFloat(sizeStr);
  }
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 'k':
    case 'kb':
      return value * 1024;
    case 'm':
    case 'mb':
      return value * 1024 * 1024;
    case 'g':
    case 'gb':
      return value * 1024 * 1024 * 1024;
    case 't':
    case 'tb':
      return value * 1024 * 1024 * 1024 * 1024;
    default:
      return value;
  }
}

/**
 * Parse command line arguments
 */
export function parseArgs(): CliParseResult {
  const result: CliParseResult = {
    configPath: null,
    init: false,
    help: false,
    version: false,
    name: null,
    port: null,
    host: null,
    staticRoot: null,
    username: null,
    password: null,
    realm: null,
    maxFileSize: null,
    sessionSecret: null,
    sessionName: null,
  };

  let i = 2;
  while (i < process.argv.length) {
    const arg = process.argv[i];
    const next = i + 1 < process.argv.length ? process.argv[i + 1] : null;

    if (arg === 'init') {
      result.init = true;
    } else if (arg === 'start') {
      // start command is default, just skip
    } else if (arg === '--version' || arg === '-v') {
      result.version = true;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if ((arg === '--config' || arg === '-c') && next) {
      result.configPath = next;
      i++;
    } else if (arg === '--name' && next) {
      result.name = next;
      i++;
    } else if (arg === '--port' && next) {
      result.port = next;
      i++;
    } else if (arg === '--host' && next) {
      result.host = next;
      i++;
    } else if (arg === '--root' && next || arg === '--static-root' && next) {
      result.staticRoot = next;
      i++;
    } else if (arg === '--username' && next || arg === '--user' && next) {
      result.username = next;
      i++;
    } else if (arg === '--password' && next || arg === '--pass' && next) {
      result.password = next;
      i++;
    } else if (arg === '--realm' && next) {
      result.realm = next;
      i++;
    } else if (arg === '--max-size' && next || arg === '--max-file-size' && next) {
      result.maxFileSize = next;
      i++;
    } else if (arg === '--session-secret' && next) {
      result.sessionSecret = next;
      i++;
    } else if (arg === '--session-name' && next) {
      result.sessionName = next;
      i++;
    // Backward compatibility for positional arguments
    } else if (result.port === null) {
      result.port = arg;
    } else if (result.staticRoot === null) {
      result.staticRoot = arg;
    }
    i++;
  }

  return result;
}

/**
 * Load JSON config from file
 */
export function loadJsonConfig(configPath: string | null): JsonConfig | null {
  let filePath: string | null = null;

  if (configPath) {
    filePath = path.resolve(process.cwd(), configPath);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: Config file not found: ${filePath}`);
      process.exit(1);
    }
  } else {
    const defaultPath = path.resolve(process.cwd(), 'zpan.config.json');
    if (fs.existsSync(defaultPath)) {
      filePath = defaultPath;
    } else {
      return null;
    }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content) as JsonConfig;
    console.log(`Loaded config from: ${filePath}`);
    return parsed;
  } catch (error) {
    console.error(`Error: Failed to parse config file ${filePath}: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * Load and merge configuration with defaults
 * Priority: defaults -> JSON config -> command line args
 */
export function loadConfig(
  parsedArgs: CliParseResult,
  jsonConfig: JsonConfig | null
): ZpanConfig {
  const config: ZpanConfig = {
    name: parsedArgs.name || jsonConfig?.name || 'zpan',
    port: parsedArgs.port ? parseInt(parsedArgs.port) : (jsonConfig?.port || 8090),
    host: parsedArgs.host || jsonConfig?.host || '127.0.0.1',
    staticRoot: parsedArgs.staticRoot || jsonConfig?.staticRoot || process.cwd(),
    username: parsedArgs.username || jsonConfig?.username || 'admin',
    password: parsedArgs.password || jsonConfig?.password || 'admin123',
    realm: parsedArgs.realm || jsonConfig?.realm || 'ZPan - Protected Area',
    maxFileSize: parsedArgs.maxFileSize ?
      parseSizeToBytes(parsedArgs.maxFileSize) :
      (jsonConfig?.maxFileSize || 10 * 1024 * 1024 * 1024), // 10GB
    sessionSecret: parsedArgs.sessionSecret || jsonConfig?.sessionSecret || crypto.randomBytes(32).toString('hex'),
    sessionName: parsedArgs.sessionName || jsonConfig?.sessionName || 'zpan',
  };

  // Resolve staticRoot to absolute path
  config.staticRoot = path.resolve(process.cwd(), config.staticRoot);

  return config;
}

/**
 * Generate default config file
 */
export function generateDefaultConfig(outputPath: string): boolean {
  if (fs.existsSync(outputPath)) {
    console.error(`Error: Config file already exists: ${outputPath}`);
    console.log('If you want to regenerate, please remove it first.');
    return false;
  }

  const defaultConfig: JsonConfig = {
    name: 'zpan',
    port: 8090,
    host: '127.0.0.1',
    staticRoot: './',
    username: 'admin',
    password: 'admin123',
    realm: 'ZPan - Protected Area',
    maxFileSize: 10737418240,
    sessionSecret: '',
    sessionName: 'zpan',
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf-8');
    console.log(`✅ Generated default config file: ${outputPath}`);
    console.log('Please edit it with your custom configuration before starting.');
    return true;
  } catch (error) {
    console.error(`Error: Failed to write config file: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Print help message
 */
export function printHelp(): void {
  console.log(`
zpan - 带认证的静态文件网盘，支持上传

Usage:
  zpan init [output-path]     Generate default config file
  zpan start [options]        Start the server

Config Options:
  -c, --config <path>         Path to JSON config file (default: zpan.config.json)
  --name <name>               Override instance name
  --port <port>               Override listen port
  --host <host>               Override bind host
  --root, --static-root <dir> Override root directory to serve
  --username, --user <user>   Override username
  --password, --pass <pass>   Override password
  --realm <realm>             Override authentication realm
  --max-size, --max-file-size <size> Override max upload size (supports 10MB, 1GB, etc.)
  --session-secret <secret>   Override session secret
  --session-name <name>       Override session cookie name

Global Options:
  -v, --version               Show version
  -h, --help                  Show help

Configuration:
  Priority: defaults < config file < command line arguments.
  All configuration options can be set in config file or overridden via command line.

Examples:
  zpan init                    Generate zpan.config.json in current directory
  zpan init my-config.json     Generate config to custom file name
  zpan start                   Start server with auto-discovery
  zpan start 8090 /path/to/files
  zpan start --config ./my-config.json
  zpan start --port 8080 --username myuser --password mypass
  zpan start --max-size 1GB --host 0.0.0.0
`);
}

/**
 * Print version
 */
export function printVersion(): void {
  console.log(`zpan v${packageJson.version}`);
}
