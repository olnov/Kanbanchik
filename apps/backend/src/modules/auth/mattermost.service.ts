import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MattermostProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface MattermostUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username: string;
}

@Injectable()
export class MattermostService {
  constructor(private readonly config: ConfigService) {}

  async authenticate(loginId: string, password: string): Promise<MattermostProfile> {
    const baseUrl = this.config.get<string>('MATTERMOST_URL');
    const enabled = this.config.get<string>('MATTERMOST_ENABLED') === 'true';
    if (!baseUrl || !enabled) {
      throw new ServiceUnavailableException('Mattermost login is not enabled');
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/api/v4/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, password }),
      });
    } catch {
      throw new ServiceUnavailableException('Mattermost unreachable');
    }

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Mattermost credentials');
    }

    const user = (await res.json()) as MattermostUser;
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name ?? '',
      lastName: user.last_name ?? '',
      username: user.username,
    };
  }
}
