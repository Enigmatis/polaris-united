import { AbstractPolarisLogger } from '@enigmatis/polaris-logs';
import { Logger, QueryRunner } from 'typeorm';

export class PolarisTypeormLogger implements Logger {
    private logger: AbstractPolarisLogger;
    private readonly options: any;

    constructor(logger: AbstractPolarisLogger, options?: any) {
        this.logger = logger;
        if (options) {
            this.options = options;
        }
    }

    public log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
        switch (level) {
            case 'log':
                if (
                    this.options === 'all' ||
                    this.options === true ||
                    (this.options instanceof Array && this.options.indexOf('log') !== -1)
                ) {
                    this.logger.debug(message);
                }
                break;
            case 'info':
                if (
                    this.options === 'all' ||
                    this.options === true ||
                    (this.options instanceof Array && this.options.indexOf('info') !== -1)
                ) {
                    this.logger.debug(message);
                }
                break;
            case 'warn':
                if (
                    this.options === 'all' ||
                    this.options === true ||
                    (this.options instanceof Array && this.options.indexOf('warn') !== -1)
                ) {
                    this.logger.warn(message);
                }
                break;
        }
    }

    public logMigration(message: string, queryRunner?: QueryRunner): any {
        this.logger.debug(message);
    }

    public logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        if (
            this.options === 'all' ||
            this.options === true ||
            (this.options instanceof Array && this.options.indexOf('query') !== -1)
        ) {
            const sql =
                query +
                (parameters && parameters.length
                    ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
                    : '');
            this.logger.debug('query' + ': ' + sql);
        }
    }

    public logQueryError(
        error: string,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner,
    ): any {
        if (
            this.options === 'all' ||
            this.options === true ||
            (this.options instanceof Array && this.options.indexOf('error') !== -1)
        ) {
            const sql =
                query +
                (parameters && parameters.length
                    ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
                    : '');
            this.logger.error(`query failed: ` + sql);
            this.logger.error(`error:` + error);
        }
    }

    public logQuerySlow(
        time: number,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner,
    ): any {
        const sql =
            query +
            (parameters && parameters.length
                ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
                : '');
        this.logger.debug(`query is slow: ` + sql);
        this.logger.debug(`execution time: ` + time);
    }

    public logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
        if (
            this.options === 'all' ||
            (this.options instanceof Array && this.options.indexOf('schema') !== -1)
        ) {
            this.logger.debug(message);
        }
    }

    protected stringifyParams(parameters: any[]) {
        try {
            return JSON.stringify(parameters);
        } catch (error) {
            // most probably circular objects in parameters
            return parameters;
        }
    }
}
