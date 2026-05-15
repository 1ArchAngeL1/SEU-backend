import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '@/user/user.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.userService.findByUsername(signInDto.username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id.toString(), username: user.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async register(username: string, password: string) {
    const user = await this.userService.create(username, password);
    const payload = { sub: user._id.toString(), username: user.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
