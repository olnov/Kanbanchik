import { getCorsConfig } from './cors.config';

describe('getCorsConfig', () => {
  it('parses origins and methods from CSV env vars', () => {
    const config = getCorsConfig({
      CORS_ORIGINS: 'http://localhost:3000, http://frontend:3000 , app://-',
      CORS_METHODS: 'GET, POST, PATCH , OPTIONS',
    });

    expect(config.origin).toEqual(['http://localhost:3000', 'http://frontend:3000', 'app://-']);
    expect(config.methods).toEqual(['GET', 'POST', 'PATCH', 'OPTIONS']);
  });

  it('falls back to defaults when env vars are empty', () => {
    const config = getCorsConfig({
      CORS_ORIGINS: '  ',
      CORS_METHODS: '',
    });

    expect(config.origin).toEqual(['http://localhost:3000', 'http://frontend:3000', 'app://-']);
    expect(config.methods).toEqual(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
  });
});
