import { Module } from "@nestjs/common";
import { Book } from "../../dal/models/book";
import { BookService } from "../services/book.service";
import { BookResolver } from "../resolvers/book.resolver";
import { TypeOrmModule } from "../../../../src/typeorm/typeorm.module";
import { DataInitializationModule } from "./data-initialization.module";
import { Author } from "../../dal/models/author";
import { PubSub } from "graphql-subscriptions";

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author]), DataInitializationModule],
  providers: [
    BookResolver,
    BookService,
    {
      provide: "PUB_SUB",
      useValue: new PubSub(),
    },
  ],
})
export class BookModule {}
