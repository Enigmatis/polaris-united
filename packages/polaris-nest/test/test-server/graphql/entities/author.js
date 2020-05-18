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
var book_1 = require("./book");
var Author = /** @class */ (function (_super) {
  __extends(Author, _super);
  function Author(firstName, lastName) {
    var _this = _super.call(this) || this;
    _this.firstName = firstName;
    _this.lastName = lastName;
    return _this;
  }
  Author.prototype.getId = function () {
    return this.id;
  };
  __decorate(
    [polaris_typeorm_1.Column({ nullable: true })],
    Author.prototype,
    "firstName"
  );
  __decorate(
    [polaris_typeorm_1.Column({ nullable: true })],
    Author.prototype,
    "lastName"
  );
  __decorate(
    [
      polaris_typeorm_1.OneToMany(
        function () {
          return book_1.Book;
        },
        function (book) {
          return book.author;
        }
      ),
    ],
    Author.prototype,
    "books"
  );
  __decorate(
    [polaris_typeorm_1.PrimaryGeneratedColumn()],
    Author.prototype,
    "id"
  );
  Author = __decorate([polaris_typeorm_1.Entity()], Author);
  return Author;
})(polaris_typeorm_1.CommonModel);
exports.Author = Author;
