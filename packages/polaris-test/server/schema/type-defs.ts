export const typeDefs = `
    type Query {
        allBooks: [Book]!
        authors: [Author]!
        allBooksPaginated: [Book]!
        allBooksWithWarnings: [Book]!
        authorById(id: String!): Author
        bookByTitle(title: String!): [Book]!
        authorsByFirstName(name: String!): [Author]!
        authorsByFirstNameFromCustomHeader: [Author]!
        customContextCustomField: Int!
        customContextInstanceMethod: String!
        permissionsField: String @permissions(entityTypes: ["foo"], actions: ["READ", "DELETE"])
    }

    type Mutation {
        createAuthor(firstName: String!, lastName: String): Author!
        createBook(title: String!, id: String): Book!
        createPen(color: String!, id: String): Pen!
        createChapter(number: Int!, bookId: String): Chapter!
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
        chapters: [Chapter]
    }

    type Pen implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        color: String
        author: Author
    }
    type Chapter implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        number: Int!
        book: Book
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
        pens: [Pen]
    }
`;
