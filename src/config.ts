import 'dotenv/config';
import crypto from 'crypto';

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
  USERNAME          Auth username (default: admin)
  PASSWORD          Auth password (default: admin123)
  USERS             Multiple users (format: user1:pass1,user2:pass2)
  SESSION_SECRET    Session secret for cookie signing (auto-generated if not set)
  SESSION_NAME      Session cookie name (default: arkpan)

Examples:
  ark-pan
  ark-pan 8090 /path/to/files
  PORT=8091 STATIC_ROOT=/data ark-pan
  USERS=alice:secret123,bob:password456 ark-pan
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

// 解析用户
function parseUsers(): Record<string, string> {
  // 如果有 USERS 环境变量，解析多用户
  if (process.env.USERS) {
    const users: Record<string, string> = {};
    const pairs = process.env.USERS.split(',');
    for (const pair of pairs) {
      const [username, password] = pair.split(':');
      if (username && password) {
        users[username.trim()] = password.trim();
      }
    }
    return users;
  }
  // 否则回退到单用户配置
  const singleUser: Record<string, string> = {};
  const username = process.env.USERNAME || 'admin';
  const password = process.env.PASSWORD || 'admin123';
  singleUser[username] = password;
  return singleUser;
}

export { parseArgs };

const { portArg, dirArg } = parseArgs();

const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : (portArg ? parseInt(portArg) : 8090),
  HOST: process.env.HOST || '127.0.0.1',
  STATIC_ROOT: process.env.STATIC_ROOT || (dirArg || process.cwd()),
  USERNAME: process.env.USERNAME || 'admin',
  PASSWORD: process.env.PASSWORD || 'admin123',
  USERS: parseUsers(),
  REALM: process.env.REALM || 'Ark Pan - Protected Area',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE
    ? parseInt(process.env.MAX_FILE_SIZE)
    : 10 * 1024 * 1024 * 1024, // 默认 10GB
  SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  SESSION_NAME: process.env.SESSION_NAME || 'arkpan',
};

export default config;
