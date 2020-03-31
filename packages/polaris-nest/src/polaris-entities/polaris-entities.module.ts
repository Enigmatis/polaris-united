import { Module } from "@nestjs/common";
import { DataVersion } from "@enigmatis/polaris-typeorm";
import {TypeOrmModule} from "../lib";

@Module({ imports: [TypeOrmModule.forFeature([DataVersion])] })
export class PolarisEntitiesModule {}
