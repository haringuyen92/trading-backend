import { Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(loginDto: LoginDto) {
    let user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      const createUserDto = new CreateUserDto();
      createUserDto.email = loginDto.email;
      createUserDto.first_name = loginDto.firstName;
      createUserDto.last_name = loginDto.lastName;
      createUserDto.avatar = loginDto.picture;

      user = await this.userService.create(createUserDto);
    }
    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    const accessTokenKey = `auth:user:${user.id}:access_token`;
    const refreshTokenKey = `auth:user:${user.id}:refresh_token`;

    await this.cacheManager.set(accessTokenKey, accessToken, 3600);
    await this.cacheManager.set(refreshTokenKey, refreshToken, 30 * 24 * 3600);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
    };
  }
}