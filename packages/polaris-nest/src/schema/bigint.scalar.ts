import { CustomScalar, Scalar } from '@nestjs/graphql';

@Scalar('BigInt', () => BigInt)
export class BigIntScalar implements CustomScalar<number, BigInt> {
    description = 'BigInt custom scalar type';

    parseValue(value: number): BigInt {
        return BigInt(value); // value from the client
    }

    serialize(value: BigInt): number {
        return Number(value); // value sent to the client
    }

    parseLiteral(ast: any): BigInt {
        return BigInt(ast.value);
    }
}
