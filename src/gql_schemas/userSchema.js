const { gql } = require("apollo-server-express");// I use REST with express so I installed this

const userSchema = gql`

 enum Role {
    ADMIN
    USER
  }

 type User {
   id: ID!
   username:String!
   email:String!
   role:Role!
   favorites:[Book] # Add to show favorites
 }

   type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String!
    category: String
    sensitiveNotes: String
    thumbnailUrl: String
  }

 type AuthPayload {
    token: String!      # JWT Token
    user: User!         # The authenticated user data
 }

 type Query {
   users: [User]
   me : User !
 }

   type Mutation {
    createUser(username: String!, email: String!, password: String!, role: Role!): User
    login(email: String!, password: String!): AuthPayload  # Login mutation now returns AuthPayload
    addFavoriteBook(userId: ID!, bookId: ID!): User
    }
`;

module.exports = userSchema;