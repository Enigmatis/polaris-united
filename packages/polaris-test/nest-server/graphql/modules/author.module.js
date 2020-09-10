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
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthorModule = void 0;
var common_1 = require('@nestjs/common');
var author_1 = require('../../dal/models/author');
var author_resolver_1 = require('../resolvers/author.resolver');
var author_service_1 = require('../services/author.service');
var typeorm_module_1 = require('../../../../polaris-nest/src/typeorm/typeorm.module');
var polaris_logger_module_1 = require('../../../../polaris-nest/src/polaris-logger/polaris-logger.module');
var polaris_logger_service_1 = require('../../../../polaris-nest/src/polaris-logger/polaris-logger.service');
var AuthorModule = /** @class */ (function() {
    function AuthorModule() {}
    AuthorModule = __decorate(
        [
            common_1.Module({
                imports: [
                    typeorm_module_1.TypeOrmModule.forFeature([author_1.Author]),
                    polaris_logger_module_1.PolarisLoggerModule,
                ],
                providers: [
                    author_resolver_1.AuthorResolver,
                    author_service_1.AuthorService,
                    polaris_logger_service_1.PolarisLoggerService,
                ],
            }),
        ],
        AuthorModule,
    );
    return AuthorModule;
})();
exports.AuthorModule = AuthorModule;
