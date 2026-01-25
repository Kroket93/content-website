/**
 * TenantStyling interface for tenant-specific theming configuration
 */
export interface TenantStyling {
  /** Unique identifier for the styling configuration */
  id?: string;

  /** Associated tenant identifier */
  tenantId?: string;

  /** Primary brand color (e.g., #3498db) */
  primaryColor: string;

  /** Secondary brand color (e.g., #2ecc71) */
  secondaryColor: string;

  /** Background color for the site (e.g., #ffffff) */
  backgroundColor: string;

  /** Main text color (e.g., #333333) */
  textColor: string;

  /** Primary font family (e.g., 'Inter, sans-serif') */
  fontFamily: string;

  /** Base font size in pixels (e.g., 16) */
  baseFontSize: number;

  /** Maximum content width in pixels (e.g., 1200) */
  maxContentWidth: number;

  /** Optional accent color for highlights */
  accentColor?: string;

  /** Optional font family for headers */
  headerFontFamily?: string;

  /** Optional URL for the tenant logo */
  logoUrl?: string;

  /** Optional URL for the favicon */
  faviconUrl?: string;

  /** Optional custom CSS to inject into the page */
  customCss?: string;
}

/**
 * Default styling values used when API fails or no tenant styling is defined
 */
export const DEFAULT_STYLING: TenantStyling = {
  primaryColor: '#3498db',
  secondaryColor: '#2ecc71',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontFamily: 'Inter, sans-serif',
  baseFontSize: 16,
  maxContentWidth: 1200,
};
