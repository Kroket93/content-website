import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_styling')
export class TenantStyling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  // Color scheme fields with defaults
  @Column({ type: 'varchar', default: '#3B82F6' })
  primaryColor: string;

  @Column({ type: 'varchar', default: '#6366F1' })
  secondaryColor: string;

  @Column({ type: 'varchar', default: '#FFFFFF' })
  backgroundColor: string;

  @Column({ type: 'varchar', default: '#1F2937' })
  textColor: string;

  // Typography fields with defaults
  @Column({ type: 'varchar', default: 'Inter, system-ui, sans-serif' })
  fontFamily: string;

  @Column({ type: 'varchar', default: '16px' })
  baseFontSize: string;

  // Layout field with default
  @Column({ type: 'varchar', default: '1200px' })
  maxContentWidth: string;

  // Custom CSS field (nullable)
  @Column({ type: 'text', nullable: true })
  customCss: string | null;

  // Branding fields (nullable)
  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  faviconUrl: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
