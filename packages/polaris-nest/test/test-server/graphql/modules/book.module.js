"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
exports.__esModule = true;
var common_1 = require("@nestjs/common");
var lib_1 = require("../../../../../src/lib");
var book_1 = require("../entities/book");
var book_service_1 = require("../services/book.service");
var book_resolver_1 = require("../resolvers/book.resolver");
var BookModule = /** @class */ (function () {
  function BookModule() {}
  BookModule = __decorate(
    [
      common_1.Module({
        imports: [lib_1.TypeOrmModule.forFeature([book_1.Book])],
        providers: [book_resolver_1.BookResolver, book_service_1.BookService],
      }),
    ],
    BookModule
  );
  return BookModule;
})();
exports.BookModule = BookModule;
