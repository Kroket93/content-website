import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantStyling } from '../entities/tenant-styling.entity';
import { CreateStylingDto } from './dto';

@Injectable()
export class StylingService {
  constructor(
    @InjectRepository(TenantStyling)
    private readonly stylingRepository: Repository<TenantStyling>,
  ) {}

  async createOrUpdate(
    tenantId: string,
    createStylingDto: CreateStylingDto,
  ): Promise<TenantStyling> {
    let styling = await this.stylingRepository.findOne({
      where: { tenantId },
    });

    if (styling) {
      // Update existing styling
      Object.assign(styling, createStylingDto);
    } else {
      // Create new styling
      styling = this.stylingRepository.create({
        tenantId,
        ...createStylingDto,
      });
    }

    return this.stylingRepository.save(styling);
  }

  async findByTenantId(tenantId: string): Promise<TenantStyling> {
    const styling = await this.stylingRepository.findOne({
      where: { tenantId },
    });

    if (!styling) {
      throw new NotFoundException(
        `Styling for tenant "${tenantId}" not found`,
      );
    }

    return styling;
  }

  async createDefaultStyling(tenantId: string): Promise<TenantStyling> {
    const existing = await this.stylingRepository.findOne({
      where: { tenantId },
    });

    if (existing) {
      return existing;
    }

    const styling = this.stylingRepository.create({ tenantId });
    return this.stylingRepository.save(styling);
  }

  generateCssVariables(styling: TenantStyling): string {
    const cssVariables = [
      ':root {',
      `  --primary-color: ${styling.primaryColor};`,
      `  --secondary-color: ${styling.secondaryColor};`,
      `  --background-color: ${styling.backgroundColor};`,
      `  --text-color: ${styling.textColor};`,
      `  --font-family: ${styling.fontFamily};`,
      `  --base-font-size: ${styling.baseFontSize};`,
      `  --max-content-width: ${styling.maxContentWidth};`,
    ];

    if (styling.logoUrl) {
      cssVariables.push(`  --logo-url: url('${styling.logoUrl}');`);
    }

    if (styling.faviconUrl) {
      cssVariables.push(`  --favicon-url: url('${styling.faviconUrl}');`);
    }

    cssVariables.push('}');

    // Add base styles
    const baseStyles = [
      '',
      'body {',
      '  font-family: var(--font-family);',
      '  font-size: var(--base-font-size);',
      '  background-color: var(--background-color);',
      '  color: var(--text-color);',
      '}',
      '',
      '.container {',
      '  max-width: var(--max-content-width);',
      '  margin: 0 auto;',
      '}',
    ];

    let css = cssVariables.join('\n') + baseStyles.join('\n');

    // Append custom CSS if present
    if (styling.customCss) {
      css += '\n\n/* Custom CSS */\n' + styling.customCss;
    }

    return css;
  }
}
