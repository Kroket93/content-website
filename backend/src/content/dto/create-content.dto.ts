import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ContentStatus } from '../../entities/content.entity';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}
