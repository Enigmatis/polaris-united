"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
var src_1 = require("../../../../src");
var author_1 = require("./author");
var graphql_1 = require("@nestjs/graphql");
var Book = /** @class */ (function (_super) {
    __extends(Book, _super);
    function Book() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        graphql_1.Field()
    ], Book.prototype, "title", void 0);
    __decorate([
        graphql_1.Field(function (type) { return author_1.Author; }, { nullable: true })
    ], Book.prototype, "author", void 0);
    __decorate([
        graphql_1.Directive("@upper"),
        graphql_1.Field()
    ], Book.prototype, "coverColor", void 0);
    Book = __decorate([
        graphql_1.ObjectType({
            implements: [src_1.RepositoryEntity],
        })
    ], Book);
    return Book;
}(src_1.RepositoryEntity));
exports.Book = Book;
