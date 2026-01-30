import { Controller, Post, Body } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.tenantId,
      registerDto.role,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
