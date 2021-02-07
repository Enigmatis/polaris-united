import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
    typePaths: [
        'C:/repos/chen/polaris-united/packages/polaris-test/nest-server-code-first-schema-first/**/*.graphql',
    ],
    path: join(process.cwd(), 'graphql.ts'),
    emitTypenameField: true,
    outputAs: 'class',
});
