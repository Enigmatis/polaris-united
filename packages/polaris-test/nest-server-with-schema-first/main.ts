import { setApp } from '@enigmatis/polaris-nest';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as polarisProperties from '../shared-resources/polaris-properties.json';
export let nestSchemaFirstApp: INestApplication;
export async function bootstrap(): Promise<INestApplication> {
    nestSchemaFirstApp = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
    });
    setApp(nestSchemaFirstApp);
    await nestSchemaFirstApp.listen(polarisProperties.port);
    return nestSchemaFirstApp;
}
