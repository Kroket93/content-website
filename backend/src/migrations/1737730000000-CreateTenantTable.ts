import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTenantTable1737730000000 implements MigrationInterface {
  name = 'CreateTenantTable1737730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'slug',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'domain',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'IDX_TENANT_SLUG',
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'IDX_TENANT_DOMAIN',
        columnNames: ['domain'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tenants', 'IDX_TENANT_DOMAIN');
    await queryRunner.dropIndex('tenants', 'IDX_TENANT_SLUG');
    await queryRunner.dropTable('tenants');
  }
}
