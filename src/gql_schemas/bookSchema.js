const { gql } = require("apollo-server-express");// I use REST with express so I installed this

const bookSchema = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String!
    category: String
    sensitiveNotes: String
    thumbnailUrl: String
  }

  type Query {
    books: [Book]
    book(id: ID!): Book  # Fetch a single book b
  }
  
  type BrokenFavoritesReport {
  username: String!
  brokenFavorites: [String!]!
}

extend type Query {
  checkFavoritesValidity: [BrokenFavoritesReport!]!
}

  type Mutation {
   createBook(
     title: String!
     author: String!
     isbn: String!
     category: String
     sensitiveNotes: String
     thumbnailUrl: String
   ): Book

   updateBook(
     id: ID!
     title: String!
     author: String!
     isbn: String!
     category: String
     sensitiveNotes: String
     thumbnailUrl: String
   ): Book

   deleteBook(id: ID!): Book
  }
`;

module.exports = bookSchema;
