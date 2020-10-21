import { PolarisError } from './polaris-error';

export class UnsupportedRealityError extends PolarisError {
    constructor(realityId: number, extensions?: { [key: string]: any }, code?: string) {
        super(
            `Reality id: ${realityId} is not supported in this repository`,
            405,
            extensions,
            code,
        );
    }
}
