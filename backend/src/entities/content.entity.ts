import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  @Index()
  tenantId: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  body: string;

  @Column({ type: 'varchar', nullable: true })
  excerpt: string | null;

  @Column({ type: 'varchar', nullable: true })
  featuredImage: string | null;

  @Column('simple-array', { nullable: true })
  tags: string[] | null;

  @Column({
    type: 'varchar',
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
