import { Module } from "@nestjs/common";
import { DataInitializationService } from "../services/data-initialization.service";
import { TypeOrmModule } from "../../../../src/typeorm/typeorm.module";
import { Author } from "../../dal/models/author";
import { Book } from "../../dal/models/book";
import { DataInitializationResolver } from "../resolvers/data-initialization.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book])],
  providers: [DataInitializationService, DataInitializationResolver],
})
export class DataInitializationModule {}
