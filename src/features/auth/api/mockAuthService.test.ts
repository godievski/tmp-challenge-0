import { mockAuthService } from './mockAuthService';

describe('mockAuthService', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns a Bearer session after one second with the correct password', async () => {
    let settled = false;
    const result = mockAuthService.login('  ana@example.com  ', '123456')
      .then((session) => { settled = true; return session; });
    await jest.advanceTimersByTimeAsync(999);
    expect(settled).toBe(false);
    await jest.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toEqual({
      accessToken: 'dummy-access-token', tokenType: 'Bearer', email: 'ana@example.com',
    });
  });

  it('rejects an incorrect password', async () => {
    const result = expect(mockAuthService.login('ana@example.com', 'wrong'))
      .rejects.toThrow('Credenciales inválidas.');
    await jest.advanceTimersByTimeAsync(1000);
    await result;
  });
});
