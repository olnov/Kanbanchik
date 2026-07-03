import { generateToken } from './token';

describe('generateToken', () => {
  it('produces a url-safe string of at least 32 chars', () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(32);
  });

  it('produces unique values', () => {
    expect(generateToken()).not.toEqual(generateToken());
  });
});
