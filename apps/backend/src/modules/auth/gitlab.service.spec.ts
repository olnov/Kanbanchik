import { GitLabService } from './gitlab.service';

describe('GitLabService', () => {
  const config = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        GITLAB_ENABLED: 'true',
        GITLAB_URL: 'https://gitlab.example.com',
        GITLAB_CLIENT_ID: 'client-id',
        GITLAB_CLIENT_SECRET: 'secret',
        GITLAB_REDIRECT_URI: 'https://app.example.com/api/v1/auth/gitlab/callback',
      };
      return values[key];
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('builds a GitLab authorization URL with the state value', () => {
    const service = new GitLabService(config as never);
    const url = new URL(service.getAuthorizationUrl('state-value'));

    expect(url.origin).toBe('https://gitlab.example.com');
    expect(url.pathname).toBe('/oauth/authorize');
    expect(url.searchParams.get('scope')).toBe('read_user');
    expect(url.searchParams.get('state')).toBe('state-value');
  });
});
