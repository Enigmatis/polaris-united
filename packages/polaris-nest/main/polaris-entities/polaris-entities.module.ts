import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataVersion } from "@enigmatis/polaris-typeorm";

@Module({ imports: [TypeOrmModule.forFeature([DataVersion])] })
export class PolarisEntitiesModule {}
