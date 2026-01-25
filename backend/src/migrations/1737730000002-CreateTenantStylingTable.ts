import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTenantStylingTable1737730000002 implements MigrationInterface {
  name = 'CreateTenantStylingTable1737730000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenant_styling',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'tenantId',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'primaryColor',
            type: 'varchar',
            default: "'#3B82F6'",
          },
          {
            name: 'secondaryColor',
            type: 'varchar',
            default: "'#6366F1'",
          },
          {
            name: 'backgroundColor',
            type: 'varchar',
            default: "'#FFFFFF'",
          },
          {
            name: 'textColor',
            type: 'varchar',
            default: "'#1F2937'",
          },
          {
            name: 'fontFamily',
            type: 'varchar',
            default: "'Inter, system-ui, sans-serif'",
          },
          {
            name: 'baseFontSize',
            type: 'varchar',
            default: "'16px'",
          },
          {
            name: 'maxContentWidth',
            type: 'varchar',
            default: "'1200px'",
          },
          {
            name: 'customCss',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'logoUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'faviconUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'tenant_styling',
      new TableForeignKey({
        name: 'FK_TENANT_STYLING_TENANT',
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tenant_styling', 'FK_TENANT_STYLING_TENANT');
    await queryRunner.dropTable('tenant_styling');
  }
}
