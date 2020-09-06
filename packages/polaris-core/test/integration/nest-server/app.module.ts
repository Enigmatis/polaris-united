import { Module } from '@nestjs/common';
import { PolarisServerConfigModule } from '../../../../polaris-nest/src/polaris-server-config/polaris-server-config.module';
import { PolarisServerConfigService } from '../../../../polaris-nest/src/polaris-server-config/polaris-server-config.service';
import { PolarisModule } from '../../../../polaris-nest/src/polaris/polaris.module';
import { TypeOrmModule } from '../../../../polaris-nest/src/typeorm/typeorm.module';
import { AuthorModule } from './graphql/modules/author.module';
import { BookModule } from './graphql/modules/book.module';
import { DataInitializationModule } from './graphql/modules/data-initialization.module';
import { createOptionsFactory } from './polaris-server-options-factory/polaris-server-options-factory-service';
import { TypeOrmOptionsFactoryService } from './type-orm-options-factory/type-orm-options-factory.service';

@Module({
    imports: [
        AuthorModule,
        BookModule,
        PolarisModule.registerAsync({
            useFactory: createOptionsFactory,
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeOrmOptionsFactoryService,
            inject: [PolarisServerConfigService],
            imports: [PolarisServerConfigModule],
        }),
        DataInitializationModule,
    ],
})
export class AppModule {}
