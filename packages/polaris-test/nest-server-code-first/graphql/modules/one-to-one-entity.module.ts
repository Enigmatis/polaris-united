import { PolarisTypeORMInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Book } from '../../../shared-resources/entities/book';
import { OneToOneEntity } from '../../../shared-resources/entities/one-to-one-entity';
import { OneToOneEntityService } from '../services/one-to-one-entity.service';
import { OneToOneEntityResolver } from '../resolvers/one-to-one-entity.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([OneToOneEntity, Book])],
    providers: [OneToOneEntityService, OneToOneEntityResolver, PolarisTypeORMInjector],
})
export class OneToOneEntityModule {}
