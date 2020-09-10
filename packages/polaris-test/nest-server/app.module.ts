import {
    PolarisModule,
    PolarisServerConfigModule,
    PolarisServerConfigService,
    TypeOrmModule,
} from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
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
