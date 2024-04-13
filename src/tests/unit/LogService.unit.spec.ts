import redis from '../../redis';
import LogService from '../../services/LogService';

afterAll(async () => {
  await redis.quit();
});

describe('LogService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 4, 11));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Log Object', async () => {
    const logService = new LogService();
    console.info = jest.fn();

    const logContent = { test: 'test' };
    logService.log(logContent);

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(new Date(), JSON.stringify(logContent));
  });

  it('Log string', async () => {
    const logService = new LogService();
    console.info = jest.fn();

    const logContent = '{ test: "test" }';
    logService.log(logContent);

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(new Date(), logContent);
  });
});
