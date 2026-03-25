require('dotenv').config();

function parseArgs(): { portArg: string | null, dirArg: string | null } {
  let portArg: string | null = null;
  let dirArg: string | null = null;
  let i = 2;
  while (i < process.argv.length) {
    if (process.argv[i] === '--version' || process.argv[i] === '-v') {
      console.log('ark-pan v1.0.0');
      process.exit(0);
    } else if (process.argv[i] === '--help' || process.argv[i] === '-h') {
      console.log(`
ark-pan - 带认证的静态文件网盘，支持上传

Usage:
  ark-pan [port] [directory]

Options:
  -v, --version    Show version
  -h, --help       Show help

Environment variables:
  PORT              Port to listen (default: 8090)
  HOST              Host to bind (default: 127.0.0.1)
  STATIC_ROOT       Directory to serve (default: current directory)
  USERNAME          Basic auth username (default: admin)
  PASSWORD          Basic auth password (default: admin123)
  REALM             Auth realm name

Examples:
  ark-pan
  ark-pan 8090 /path/to/files
  PORT=8091 STATIC_ROOT=/data ark-pan
`);
      process.exit(0);
    } else if (portArg === null) {
      portArg = process.argv[i];
    } else if (dirArg === null) {
      dirArg = process.argv[i];
    }
    i++;
  }

  return { portArg, dirArg };
}

const { portArg, dirArg } = parseArgs();

export default {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : (portArg ? parseInt(portArg) : 8090),
  HOST: process.env.HOST || '127.0.0.1',
  STATIC_ROOT: process.env.STATIC_ROOT || (dirArg || process.cwd()),
  USERNAME: process.env.USERNAME || 'admin',
  PASSWORD: process.env.PASSWORD || 'admin123',
  REALM: process.env.REALM || 'Ark Pan - Protected Area',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE
    ? parseInt(process.env.MAX_FILE_SIZE)
    : 10 * 1024 * 1024 * 1024, // 默认 10GB
};
