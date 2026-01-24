import {
  IsString,
  IsOptional,
  Matches,
  IsUrl,
} from 'class-validator';

// Regex pattern for hex colors: #RGB or #RRGGBB
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export class CreateStylingDto {
  // Color scheme fields
  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'primaryColor must be a valid hex color (#RGB or #RRGGBB)',
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'secondaryColor must be a valid hex color (#RGB or #RRGGBB)',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'backgroundColor must be a valid hex color (#RGB or #RRGGBB)',
  })
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'textColor must be a valid hex color (#RGB or #RRGGBB)',
  })
  textColor?: string;

  // Typography fields
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  baseFontSize?: string;

  // Layout field
  @IsOptional()
  @IsString()
  maxContentWidth?: string;

  // Custom CSS field
  @IsOptional()
  @IsString()
  customCss?: string;

  // Branding fields
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl must be a valid URL' })
  logoUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'faviconUrl must be a valid URL' })
  faviconUrl?: string;
}
