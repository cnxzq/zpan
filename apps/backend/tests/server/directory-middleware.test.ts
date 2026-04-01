import { createDirectoryMiddleware, isImage } from '../../src/server/middleware/directory';

const testConfig = {
  name: 'test',
  port: 3000,
  host: '127.0.0.1',
  staticRoot: './',
  username: 'admin',
  password: 'admin123',
  realm: 'ZPan - Test',
  maxFileSize: 10 * 1024 * 1024 * 1024,
  sessionSecret: 'test-secret',
  sessionName: 'zpan',
};

describe('createDirectoryMiddleware', () => {
  it('should return static and directory middleware', () => {
    const result = createDirectoryMiddleware(testConfig);
    expect(result.static).toBeDefined();
    expect(result.directory).toBeDefined();
    expect(typeof result.static).toBe('function');
    expect(typeof result.directory).toBe('function');
  });
});

describe('isImage', () => {
  it('should return true for jpg', () => {
    expect(isImage('test.jpg')).toBe(true);
  });

  it('should return true for jpeg', () => {
    expect(isImage('test.jpeg')).toBe(true);
  });

  it('should return true for png', () => {
    expect(isImage('test.png')).toBe(true);
  });

  it('should return true for gif', () => {
    expect(isImage('test.gif')).toBe(true);
  });

  it('should return true for webp', () => {
    expect(isImage('test.webp')).toBe(true);
  });

  it('should return true for bmp', () => {
    expect(isImage('test.bmp')).toBe(true);
  });

  it('should return true for uppercase extension', () => {
    expect(isImage('TEST.JPG')).toBe(true);
    expect(isImage('Test.Png')).toBe(true);
  });

  it('should return false for non-image files', () => {
    expect(isImage('test.txt')).toBe(false);
    expect(isImage('test.pdf')).toBe(false);
    expect(isImage('test.zip')).toBe(false);
    expect(isImage('test.exe')).toBe(false);
    expect(isImage('test.js')).toBe(false);
    expect(isImage('test.html')).toBe(false);
  });

  it('should return false for files without extension', () => {
    expect(isImage('README')).toBe(false);
  });
});
