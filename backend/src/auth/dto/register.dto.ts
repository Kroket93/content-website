import { IsEmail, IsString, MinLength, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
