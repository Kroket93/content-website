import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase alphanumeric with hyphens (e.g., tech-blog, cooking-tips)',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  domain?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
