"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
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
var polaris_typeorm_1 = require("@enigmatis/polaris-typeorm");
var author_1 = require("../../dal/models/author");
var Book = /** @class */ (function (_super) {
  __extends(Book, _super);
  function Book(title, author) {
    var _this = _super.call(this) || this;
    _this.title = title;
    _this.author = author;
    return _this;
  }
  Book.prototype.getId = function () {
    return this.id;
  };
  __decorate(
    [polaris_typeorm_1.Column({ nullable: true })],
    Book.prototype,
    "title"
  );
  __decorate(
    [
      polaris_typeorm_1.ManyToOne(
        function () {
          return author_1.Author;
        },
        function (author) {
          return author.books;
        }
      ),
    ],
    Book.prototype,
    "author"
  );
  __decorate(
    [polaris_typeorm_1.PrimaryGeneratedColumn("uuid")],
    Book.prototype,
    "id"
  );
  Book = __decorate([polaris_typeorm_1.Entity()], Book);
  return Book;
})(polaris_typeorm_1.CommonModel);
exports.Book = Book;
