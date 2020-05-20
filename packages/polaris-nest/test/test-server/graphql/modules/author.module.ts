import { Module } from "@nestjs/common";
import { Author } from "../../dal/models/author";
import { AuthorResolver } from "../resolvers/author.resolver";
import { AuthorService } from "../services/author.service";
import { TypeOrmModule } from "../../../../src/typeorm/typeorm.module";
import { PolarisLoggerModule } from "../../../../src/polaris-logger/polaris-logger.module";
import { PolarisLoggerService } from "../../../../src/polaris-logger/polaris-logger.service";

@Module({
  imports: [TypeOrmModule.forFeature([Author]), PolarisLoggerModule],
  providers: [AuthorResolver, AuthorService, PolarisLoggerService],
})
export class AuthorModule {}
