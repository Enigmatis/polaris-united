"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModule = void 0;
var common_1 = require("@nestjs/common");
var book_1 = require("../../dal/models/book");
var book_service_1 = require("../services/book.service");
var book_resolver_1 = require("../resolvers/book.resolver");
var typeorm_module_1 = require("../../../../src/typeorm/typeorm.module");
var data_initialization_module_1 = require("./data-initialization.module");
var author_1 = require("../../dal/models/author");
var graphql_subscriptions_1 = require("graphql-subscriptions");
var BookModule = /** @class */ (function () {
    function BookModule() {
    }
    BookModule = __decorate([
        common_1.Module({
            imports: [typeorm_module_1.TypeOrmModule.forFeature([book_1.Book, author_1.Author]), data_initialization_module_1.DataInitializationModule],
            providers: [
                book_resolver_1.BookResolver,
                book_service_1.BookService,
                {
                    provide: "PUB_SUB",
                    useValue: new graphql_subscriptions_1.PubSub(),
                },
            ],
        })
    ], BookModule);
    return BookModule;
}());
exports.BookModule = BookModule;
