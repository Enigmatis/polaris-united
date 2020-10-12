export const typeDefs = `
    type Query {
        allBooks: [Book]!
        allBooksPaginated: [Book]!
        allBooksWithWarnings: [Book]!
        authorById(id: String!): Author
        bookById(id: String!): Book
        bookByTitle(title: String!): [Book]!
        authorsByFirstName(name: String!): [Author]!
        authorsByFirstNameFromCustomHeader: [Author]!
        customContextCustomField: Int!
        customContextInstanceMethod: String!
        permissionsField: String @permissions(entityTypes: ["foo"], actions: ["READ", "DELETE"])
    }

    type Mutation {
        createAuthor(firstName: String!, lastName: String): Author!
        createBook(title: String!, authorId: String): Book!
        updateBooksByTitle(title: String!, newTitle: String!): [Book]!
        deleteBook(id: String!): Boolean
        deleteAuthor(id: String!): Boolean
        fail: Boolean
    }

    type Subscription {
        bookUpdated: Book
    }

    type Book implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        title: String
        author: Author
    }

    type Author implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        firstName: String
        lastName: String
        books: [Book]
    }
`;
