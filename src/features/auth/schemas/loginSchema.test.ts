import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('accepts a valid email and removes surrounding whitespace', () => {
    expect(loginSchema.parse({ email: '  ana@example.com  ', password: '123456' }))
      .toEqual({ email: 'ana@example.com', password: '123456' });
  });

  it.each(['', '   ', 'ana', 'ana@', '@example.com'])('rejects invalid email %j', (email) => {
    expect(loginSchema.safeParse({ email, password: '123456' }).success).toBe(false);
  });

  it('requires a password without enforcing the mock credentials in the form', () => {
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: '' }).success)
      .toBe(false);
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: 'other' }).success)
      .toBe(true);
  });
});
