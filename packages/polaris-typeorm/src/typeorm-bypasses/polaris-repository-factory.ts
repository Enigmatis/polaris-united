import { EntityManager, EntityMetadata, QueryRunner } from 'typeorm';
import { PolarisRepository } from './polaris-repository';

export class PolarisRepositoryFactory {
    public create(
        manager: EntityManager,
        metadata: EntityMetadata,
        queryRunner?: QueryRunner,
    ): PolarisRepository<any> {
        const repository: PolarisRepository<any> = new PolarisRepository();
        Object.assign(repository, {
            manager,
            metadata,
            queryRunner,
        });
        return repository;
    }
}
