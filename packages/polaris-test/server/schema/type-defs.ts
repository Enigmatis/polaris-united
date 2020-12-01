export const typeDefs = `
    type Query {
        allBooks: [Book]!
        authors: [Author]!
        allBooksPaginatedWithException: [Book]
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
        permissionsFieldWithHeader: String @permissions(entityTypes: ["bar"], actions: ["READ", "DELETE"])
        onlinePaginatedBooks(pagingArgs: OnlinePagingInput!): BookConnection
        bookByDate(filter: EntityFilter): [Book]!
    }

    input ReviewKind{
        site: String
        name: String
    }
    
    type Mutation {
        createAuthor(firstName: String!, lastName: String): Author!
        createBook(title: String!, authorId: String): Book!
        createPen(color: String!, id: String): Pen!
        createChapter(number: Int!, bookId: String): Chapter!
        createReview(description:String!, rating:String!, bookId: String!, reviewKind: ReviewKind!): Review!
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
        reviews: [Review]
    }
    
    interface Review implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        rating: Int!
        description: String!
        book: Book!
    }
    
    type ProfessionalReview implements Review {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        rating: Int!
        description: String!
        book: Book!
        site: String!
    }
    
    type SimpleReview implements Review {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        rating: Int!
        description: String!
        book: Book!
        name: String!
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
    
    type BookEdge {
        node: Book
        cursor: String
    }
    
    type BookConnection {
        pageInfo: PageInfo
        edges: [BookEdge]
    }
`;
