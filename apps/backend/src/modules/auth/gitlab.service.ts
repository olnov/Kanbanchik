import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GitLabProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface GitLabUser {
  id: number;
  email?: string;
  name?: string;
  username?: string;
}

@Injectable()
export class GitLabService {
  constructor(private readonly config: ConfigService) {}

  getAuthorizationUrl(state: string): string {
    const { baseUrl, clientId, redirectUri } = this.getConfig();
    const url = new URL('/oauth/authorize', baseUrl);
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read_user',
      state,
    }).toString();
    return url.toString();
  }

  async authenticate(code: string): Promise<GitLabProfile> {
    const { baseUrl, clientId, clientSecret, redirectUri } = this.getConfig();
    let tokenResponse: Response;
    try {
      tokenResponse = await fetch(new URL('/oauth/token', baseUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });
    } catch {
      throw new ServiceUnavailableException('GitLab unreachable');
    }

    if (!tokenResponse.ok) throw new UnauthorizedException('GitLab authorization failed');
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) throw new UnauthorizedException('GitLab authorization failed');

    let userResponse: Response;
    try {
      userResponse = await fetch(new URL('/api/v4/user', baseUrl), {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
    } catch {
      throw new ServiceUnavailableException('GitLab unreachable');
    }
    if (!userResponse.ok) throw new UnauthorizedException('GitLab authorization failed');

    const user = (await userResponse.json()) as GitLabUser;
    if (!user.id || !user.email || !user.username) {
      throw new UnauthorizedException('GitLab profile is incomplete');
    }
    const [firstName = user.username, ...lastName] = (user.name || user.username)
      .trim()
      .split(/\s+/);
    return {
      id: String(user.id),
      email: user.email,
      firstName,
      lastName: lastName.join(' '),
      username: user.username,
    };
  }

  private getConfig() {
    const enabled = this.config.get<string>('GITLAB_ENABLED') === 'true';
    const baseUrl = this.config.get<string>('GITLAB_URL');
    const clientId = this.config.get<string>('GITLAB_CLIENT_ID');
    const clientSecret = this.config.get<string>('GITLAB_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GITLAB_REDIRECT_URI');
    if (!enabled || !baseUrl || !clientId || !clientSecret || !redirectUri) {
      throw new ServiceUnavailableException('GitLab login is not enabled');
    }
    return { baseUrl, clientId, clientSecret, redirectUri };
  }
}
