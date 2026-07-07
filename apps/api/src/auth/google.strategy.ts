import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Response } from 'express';
import { Profile, Strategy } from 'passport-google-oauth20';

export const googleEnabled = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!googleEnabled()) {
      throw new ServiceUnavailableException(
        "Google OAuth n'est pas configuré sur ce serveur",
      );
    }
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser, info: unknown): TUser {
    if (err || !user) {
      console.error('[Google OAuth] échec :', err ?? info);
      // Pas de 500 brut : on renvoie l'utilisateur vers la page de connexion
      const webUrl = process.env.WEB_URL?.split(',')[0] ?? 'http://localhost:3000';
      throw new OAuthRedirectException(`${webUrl}/connexion?error=google`);
    }
    return user;
  }
}

/** Exception portant l'URL de redirection, interceptée par le filtre ci-dessous. */
export class OAuthRedirectException extends Error {
  constructor(public readonly url: string) {
    super('Redirection OAuth');
  }
}

@Catch(OAuthRedirectException)
export class OAuthRedirectFilter implements ExceptionFilter {
  catch(exception: OAuthRedirectException, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>().redirect(exception.url);
  }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      nom: profile.displayName,
    };
  }
}
