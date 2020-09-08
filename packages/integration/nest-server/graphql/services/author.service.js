'use strict';
var __decorate =
    (this && this.__decorate) ||
    function(decorators, target, key, desc) {
        var c = arguments.length,
            r =
                c < 3
                    ? target
                    : desc === null
                    ? (desc = Object.getOwnPropertyDescriptor(target, key))
                    : desc,
            d;
        if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') {
            r = Reflect.decorate(decorators, target, key, desc);
        } else {
            for (var i = decorators.length - 1; i >= 0; i--) {
                if ((d = decorators[i])) {
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                }
            }
        }
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
var __param =
    (this && this.__param) ||
    function(paramIndex, decorator) {
        return function(target, key) {
            decorator(target, key, paramIndex);
        };
    };
var __awaiter =
    (this && this.__awaiter) ||
    function(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function(resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator.throw(value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __generator =
    (this && this.__generator) ||
    function(thisArg, body) {
        var _ = {
                label: 0,
                sent: function() {
                    if (t[0] & 1) {
                        throw t[1];
                    }
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function() {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function(v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) {
                throw new TypeError('Generator is already executing.');
            }
            while (_) {
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y.return
                                    : op[0]
                                    ? y.throw || ((t = y.return) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    ) {
                        return t;
                    }
                    if (((y = 0), t)) {
                        op = [op[0] & 2, t.value];
                    }
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) {
                                _.ops.pop();
                            }
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            }
            if (op[0] & 5) {
                throw op[1];
            }
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthorService = void 0;
var common_1 = require('@nestjs/common');
var polaris_core_1 = require('packages/polaris-core/dist/src');
var graphql_1 = require('@nestjs/graphql');
var author_1 = require('../../dal/models/author');
var typeorm_1 = require('@nestjs/typeorm');
var AuthorService = /** @class */ (function() {
    function AuthorService(authorRepository, connection, ctx) {
        this.authorRepository = authorRepository;
        this.connection = connection;
        this.ctx = ctx;
    }
    AuthorService.prototype.create = function(firstName, lastName) {
        return __awaiter(this, void 0, void 0, function() {
            var author;
            return __generator(this, function(_a) {
                switch (_a.label) {
                    case 0:
                        author = new author_1.Author(firstName, lastName);
                        return [4 /*yield*/, this.authorRepository.save(this.ctx, author)];
                    case 1:
                        return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AuthorService.prototype.findOneById = function(id) {
        return __awaiter(this, void 0, void 0, function() {
            return __generator(this, function(_a) {
                return [2 /*return*/, this.authorRepository.findOne(this.ctx, id)];
            });
        });
    };
    AuthorService.prototype.findOneByName = function(name) {
        return __awaiter(this, void 0, void 0, function() {
            return __generator(this, function(_a) {
                return [2 /*return*/, this.authorRepository.findOne(this.ctx, name)];
            });
        });
    };
    AuthorService.prototype.findByName = function(name) {
        return __awaiter(this, void 0, void 0, function() {
            return __generator(this, function(_a) {
                return [
                    2 /*return*/,
                    this.authorRepository.find(this.ctx, {
                        where: { firstName: polaris_core_1.Like('%' + name + '%') },
                    }),
                ];
            });
        });
    };
    AuthorService.prototype.findByFirstName = function() {
        return __awaiter(this, void 0, void 0, function() {
            return __generator(this, function(_a) {
                return [
                    2 /*return*/,
                    this.authorRepository.find(this.ctx, {
                        where: {
                            firstName: polaris_core_1.Like(
                                '%' + this.ctx.requestHeaders.customHeader + '%',
                            ),
                        },
                    }),
                ];
            });
        });
    };
    AuthorService.prototype.deleteAuthor = function(id) {
        return __awaiter(this, void 0, void 0, function() {
            var result;
            return __generator(this, function(_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, this.authorRepository.delete(this.ctx, id)];
                    case 1:
                        result = _a.sent();
                        return [
                            2 /*return*/,
                            result &&
                                result.affected !== null &&
                                result.affected !== undefined &&
                                result.affected > 0,
                        ];
                }
            });
        });
    };
    AuthorService.prototype.returnCustomField = function() {
        return this.ctx.customField;
    };
    AuthorService.prototype.customContextInstanceMethod = function() {
        return this.ctx.instanceInContext.doSomething();
    };
    AuthorService = __decorate(
        [
            common_1.Injectable({ scope: common_1.Scope.REQUEST }),
            __param(0, typeorm_1.InjectRepository(author_1.Author)),
            __param(1, typeorm_1.InjectConnection()),
            __param(2, common_1.Inject(graphql_1.CONTEXT)),
        ],
        AuthorService,
    );
    return AuthorService;
})();
exports.AuthorService = AuthorService;
