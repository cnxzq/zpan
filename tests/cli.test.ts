// cli 只是入口，测试它能正常导入
import '../src/cli';

describe('cli', () => {
  it('should import without error', () => {
    expect(true).toBe(true);
  });
});
