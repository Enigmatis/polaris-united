import { INestApplication } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
export * from '@enigmatis/polaris-core';
export { RepositoryEntity } from './schema/repository-entity.model';
export { PolarisModule } from './polaris/polaris.module';
export { PolarisLoggerService } from './polaris-logger/polaris-logger.service';
export { PolarisLoggerModule } from './polaris-logger/polaris-logger.module';
export { PolarisServerConfigService } from './polaris-server-config/polaris-server-config.service';
export { PolarisServerConfigModule } from './polaris-server-config/polaris-server-config.module';
export { TypeOrmModule } from './typeorm/typeorm.module';
export { PolarisTypeOrmModuleOptions } from './typeorm/typeorm-core.module';
export const setApp = (app: INestApplication, version?: string) => {
    app.use(
        `/@apollographql/graphql-playground-react@${version || 'v1'}`,
        express.static(path.join(__dirname, '../static/playground')),
    );
};
