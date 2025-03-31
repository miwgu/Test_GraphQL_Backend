const { gql } = require("apollo-server");

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
  }
`;

module.exports = userSchema;