export const typeDefs = `
    directive @upper on FIELD_DEFINITION

    type Query {
        allBooks: [Book]!
        bookByTitle(title: String!): [Book]!
    }

    type Book implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        dataVersion: BigInt!
        title: String
        coverColor: String @upper
    }
`;
