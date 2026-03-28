import fs from 'fs';
import path from 'path';
import os from 'os';
import { vi } from 'vitest';
import { loadJsonConfig, generateDefaultConfig } from '../../src/config/loader';
import type { JsonConfig } from '../../src/config/schema';

describe('loadJsonConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = os.tmpdir();
  });

  it('should load and parse valid json config', () => {
    const testConfig = {
      name: 'test-config',
      port: 8888,
      username: 'testuser',
    };
    const testPath = path.join(tempDir, `test-${Date.now()}.json`);
    fs.writeFileSync(testPath, JSON.stringify(testConfig), 'utf-8');

    const result = loadJsonConfig(testPath);
    expect(result).toEqual(testConfig);

    fs.unlinkSync(testPath);
  });

  it('should return null when no config path and no default file', () => {
    const tempPath = path.join(tempDir, `test-${Date.now()}`);
    fs.mkdirSync(tempPath);

    // Mock process.cwd instead of changing directory
    const originalCwd = process.cwd;
    vi.spyOn(process, 'cwd').mockReturnValue(tempPath);

    const result = loadJsonConfig(null);
    expect(result).toBeNull();

    vi.restoreAllMocks();
    fs.rmSync(tempPath, { recursive: true });
  });

  it('should load default config from cwd when it exists', () => {
    const tempPath = path.join(tempDir, `test-${Date.now()}`);
    fs.mkdirSync(tempPath);

    const testConfig: JsonConfig = {
      name: 'default-test',
      port: 9999,
    };
    fs.writeFileSync(path.join(tempPath, 'zpan.config.json'), JSON.stringify(testConfig), 'utf-8');

    // Mock process.cwd instead of changing directory
    const originalCwd = process.cwd;
    vi.spyOn(process, 'cwd').mockReturnValue(tempPath);

    const result = loadJsonConfig(null);
    expect(result).toEqual(testConfig);

    vi.restoreAllMocks();
    fs.rmSync(tempPath, { recursive: true });
  });
});

describe('generateDefaultConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = os.tmpdir();
  });

  it('should generate default config file successfully', () => {
    const outputPath = path.join(tempDir, `test-config-${Date.now()}.json`);
    const result = generateDefaultConfig(outputPath);

    expect(result).toBe(true);
    expect(fs.existsSync(outputPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    expect(content.name).toBe('zpan');
    expect(content.port).toBe(8090);
    expect(content.username).toBe('admin');
    expect(content.password).toBe('admin123');

    fs.unlinkSync(outputPath);
  });

  it('should return false when file already exists', () => {
    const outputPath = path.join(tempDir, `existing-config-${Date.now()}.json`);
    fs.writeFileSync(outputPath, '{}', 'utf-8');

    const result = generateDefaultConfig(outputPath);
    expect(result).toBe(false);
    expect(fs.existsSync(outputPath)).toBe(true);

    fs.unlinkSync(outputPath);
  });
});
