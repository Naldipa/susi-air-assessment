import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { DataService } from '../shared/data/data.service';

export interface AuthPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly demoUsername: string;
  private readonly demoPassword: string;

  constructor(@Inject(DataService) private readonly data: DataService) {
    const production = process.env.NODE_ENV === 'production';
    const secret = process.env.TOKEN_SECRET;
    const username = process.env.DEMO_USERNAME;
    const password = process.env.DEMO_PASSWORD;

    if (production && (!secret || secret.length < 32 || !username || !password)) {
      throw new InternalServerErrorException(
        'Production requires a 32-character TOKEN_SECRET, DEMO_USERNAME, and DEMO_PASSWORD',
      );
    }

    this.secret = secret ?? 'local-only-token-secret-change-before-production';
    this.demoUsername = username ?? 'johndoe';
    this.demoPassword = password ?? 'susiairtest';
  }

  login(username: string, password: string): {
    accessToken: string;
    tokenType: 'Bearer';
    expiresInSeconds: number;
    user: { username: string; name: string };
  } {
    const usernameMatches = safeEqual(username, this.demoUsername);
    const passwordMatches = safeEqual(password, this.demoPassword);

    if (!usernameMatches || !passwordMatches) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload: AuthPayload = {
      sub: 'pilot-001',
      username: this.demoUsername,
      iat: now,
      exp: now + TOKEN_LIFETIME_SECONDS,
    };
    const accessToken = this.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresInSeconds: TOKEN_LIFETIME_SECONDS,
      user: {
        username: this.demoUsername,
        name: this.data.flightHours.pilot.name,
      },
    };
  }

  verify(token: string): AuthPayload {
    if (token.length > 4096) throw new UnauthorizedException('Invalid bearer token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid bearer token');

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expected = Buffer.from(this.signature(encodedHeader + '.' + encodedPayload), 'base64url');
    const received = Buffer.from(encodedSignature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    let header: unknown;
    let payload: unknown;
    try {
      header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as unknown;
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as unknown;
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }

    if (!isRecord(header) || !isRecord(payload)) {
      throw new UnauthorizedException('Invalid bearer token');
    }
    const tokenHeader = header as { alg?: unknown };
    const claims = payload as Partial<AuthPayload>;
    if (
      tokenHeader.alg !== 'HS256' ||
      claims.sub !== 'pilot-001' ||
      typeof claims.username !== 'string' ||
      !Number.isInteger(claims.exp) ||
      (claims.exp as number) <= Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Invalid or expired bearer token');
    }

    return claims as AuthPayload;
  }

  private sign(payload: AuthPayload): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return header + '.' + body + '.' + this.signature(header + '.' + body);
  }

  private signature(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
