import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { setApp } from '../../../../polaris-nest/src';
import { AppModule } from './app.module';
import * as polarisProperties from './resources/polaris-properties.json';
export let app: INestApplication;
export async function bootstrap() {
    app = await NestFactory.create(AppModule);
    setApp(app);
    await app.listen(polarisProperties.port);
}
