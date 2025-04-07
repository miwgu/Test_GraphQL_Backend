require('dotenv').config(); // To load the environment variables from .env file!

const { ApolloServer } = require("apollo-server");
//const { mergeTypeDefs } = require('@graphql-tools/merge');
//const { mergeResolvers } = require('@graphql-tools/merge');
const bookResolvers = require("./src/resolvers/bookResolvers");
const userResolvers = require("./src/resolvers/userResolvers");
const bookSchema = require("./src/schemas/bookSchema");
const userSchema = require("./src/schemas/userSchema");
const authenticateToken = require('./src/auth/auth'); 

const connectDB = require("./src/config/db");
// Connect to the database
connectDB();

// Merge schemas and resolvers
//const typeDefs = mergeTypeDefs([userSchema, bookSchema]);
//const resolvers = mergeResolvers([userResolvers, bookResolvers]);

// Apollo Server Setup
const server = new ApolloServer({
  typeDefs: [bookSchema, userSchema],
  //typeDefs,
  //resolvers,
   resolvers: { 
    Query: { 
      ...bookResolvers.Query, 
      ...userResolvers.Query 
    }, 
    Mutation: { 
      ...bookResolvers.Mutation, 
      ...userResolvers.Mutation 
    },
    /* User: { ...userResolvers.User },  */ 
  }, 
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    let user = null;
    
    if(token){
      try{
        user = authenticateToken(token.replace("Bearer ", ""));
      } catch (err){
        console.error('Token verification failed:', err);
      }
    }
    
    return { user };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});