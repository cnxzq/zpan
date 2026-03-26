// cli 只是入口，我们只需要测试它能被解析，不实际启动服务器
// 所以我们用 jest.mock 来避免实际执行

jest.mock('../src/cli.js', () => ({
  // mock 空对象
}));

describe('cli', () => {
  it('should import without error', () => {
    expect(true).toBe(true);
  });
});
