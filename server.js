require('dotenv').config(); // To load the environment variables from .env file!

const { ApolloServer } = require("apollo-server-express");
const express = require('express');
//const { mergeTypeDefs } = require('@graphql-tools/merge');
//const { mergeResolvers } = require('@graphql-tools/merge');
const bookResolvers = require("./src/gql_resolvers/bookResolvers");
const userResolvers = require("./src/gql_resolvers/userResolvers");
const bookSchema = require("./src/gql_schemas/bookSchema");
const userSchema = require("./src/gql_schemas/userSchema");
const authenticateToken = require('./src/auth/auth'); 

const connectDB = require("./src/config/db");

//REST import
const authRoutes = require('./src/rest/routes/authRoutes');
const booksRoutes = require('./src/rest/routes/booksRoutes');
//const usersRoutes = require('./src/rest/routes/usersRoutes');

//Create Express app
const app = express();
app.use(express.json())

// Connect to the database
connectDB();

app.use('/rest/auth', authRoutes);
app.use('/rest/book', booksRoutes);

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

/* 
//This syntax is specific to Apollo Server (not integrated Express)
server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
}); */


async function startServer() {
  await server.start(); // Required before applying middleware
  server.applyMiddleware({ app });// Apply Apollo GraphQL middleware to Express app

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📚 REST endpoints start at http://localhost:${PORT}/rest`);
  });
}

startServer();
