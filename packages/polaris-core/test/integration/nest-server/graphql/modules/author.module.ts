import { Module } from '@nestjs/common';
import { PolarisLoggerModule } from '../../../../../../polaris-nest/src/polaris-logger/polaris-logger.module';
import { PolarisLoggerService } from '../../../../../../polaris-nest/src/polaris-logger/polaris-logger.service';
import { TypeOrmModule } from '../../../../../../polaris-nest/src/typeorm/typeorm.module';
import { Author } from '../../dal/models/author';
import { AuthorResolver } from '../resolvers/author.resolver';
import { AuthorService } from '../services/author.service';

@Module({
    imports: [TypeOrmModule.forFeature([Author]), PolarisLoggerModule],
    providers: [AuthorResolver, AuthorService, PolarisLoggerService],
})
export class AuthorModule {}
