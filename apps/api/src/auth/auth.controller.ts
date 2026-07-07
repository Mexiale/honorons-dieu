import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { GoogleAuthGuard, OAuthRedirectFilter } from './google.strategy';
import { CurrentUser, JwtAuthGuard } from './guards';

@Controller('auth')
@UseFilters(OAuthRedirectFilter)
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: unknown) {
    return user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  google() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const { token } = await this.auth.googleLogin(req.user);
    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
    res.redirect(`${webUrl}/connexion?token=${token}`);
  }
}
