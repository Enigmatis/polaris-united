import {defaultFieldResolver, GraphQLField} from 'graphql';
import {SchemaDirectiveVisitor} from 'apollo-server-express';

export class UpperCaseDirective extends SchemaDirectiveVisitor {
    public visitFieldDefinition(field: GraphQLField<any, any>) {
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function (...args) {
            const result = await resolve.apply(this, args);
            if (typeof result === 'string') {
                return result.toUpperCase();
            }
            return result;
        };
    }
}
