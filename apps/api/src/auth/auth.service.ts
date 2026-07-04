import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private sign(user: { id: number; email: string; role: string; nom: string }) {
    return {
      token: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }),
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');
    const user = await this.prisma.utilisateur.create({
      data: {
        nom: dto.nom,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
      },
    });
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (!user?.password || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return this.sign(user);
  }

  async googleLogin(profile: {
    googleId: string;
    email: string;
    nom: string;
  }) {
    let user = await this.prisma.utilisateur.findUnique({
      where: { email: profile.email },
    });
    if (!user) {
      user = await this.prisma.utilisateur.create({
        data: {
          nom: profile.nom,
          email: profile.email,
          googleId: profile.googleId,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: { googleId: profile.googleId },
      });
    }
    return this.sign(user);
  }
}
