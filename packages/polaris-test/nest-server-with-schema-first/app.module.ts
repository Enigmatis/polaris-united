import {
    PolarisModule,
    PolarisServerConfigModule,
    PolarisServerConfigService,
    TypeOrmModule,
} from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { AuthorModule } from './graphql/modules/author.module';
import { BookModule } from './graphql/modules/book.module';
import { createOptionsFactory } from './polaris-server-options-factory/polaris-server-options-factory-service';
import { TypeOrmOptionsFactoryService } from './type-orm-options-factory/type-orm-options-factory.service';
import { ChapterModule } from './graphql/modules/chapter.module';
import { PenModule } from './graphql/modules/pen.module';
import { ReviewModule } from './graphql/modules/review.module';
import { QueryModule } from './graphql/modules/query.module';
import { join } from 'path';

@Module({
    imports: [
        AuthorModule,
        BookModule,
        ChapterModule,
        PenModule,
        ReviewModule,
        PolarisModule.registerAsync({
            useFactory: createOptionsFactory,
        }),
        QueryModule,
        TypeOrmModule.forRootAsync({
            useClass: TypeOrmOptionsFactoryService,
            inject: [PolarisServerConfigService],
            imports: [PolarisServerConfigModule],
        }),
    ],
})
export class AppModule {}
