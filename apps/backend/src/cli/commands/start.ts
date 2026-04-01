import { InstanceManager } from '../../core/manager';
import { parseArgs, loadJsonConfig, loadConfig, printHelp, printVersion } from '../../config/loader';
import { getIndexHtmlPath } from '../../utils/path';
import type { ZpanConfig } from '../../config/schema';

/**
 * start command - start the ZPan server
 */
export async function runStart(): Promise<void> {
  const parsed = parseArgs();

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  if (parsed.version) {
    printVersion();
    process.exit(0);
  }

  const jsonConfig = loadJsonConfig(parsed.configPath);
  const config = loadConfig(parsed, jsonConfig);

  const manager = new InstanceManager();
  const instance = manager.create(config);

  await instance.start();

  console.log(`🚀 ZPan running on ${instance.getAddress()}`);
  console.log(`📂 Serving user files from: ${config.staticRoot}`);
  console.log(`🌐 Frontend from: ${getIndexHtmlPath()}`);
  console.log(`🔐 Single user mode. Credentials: ${config.username} / ${config.password}`);
  console.log(`📤 Upload feature enabled`);
  console.log(`📏 Max file size: ${(config.maxFileSize / 1024 / 1024 / 1024).toFixed(0)}GB`);

  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await instance.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down...');
    await instance.stop();
    process.exit(0);
  });
}
