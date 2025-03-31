require('dotenv').config(); // To load the environment variables from .env file!

const { ApolloServer, gql } = require("apollo-server");
//const mongoose = require("mongoose");
//const Book = require("./models/Book");
//const User = require("./models/User");
//const { generateToken } = require("./auth/auth");
const bookResolvers = require("./src/resolvers/bookResolvers");
const userResolvers = require("./src/resolvers/userResolvers");
const bookSchema = require("./src/schemas/bookSchema");
const userSchema = require("./src/schemas/userSchema");
const authenticateToken = require('./src/auth/auth'); 

const connectDB = require("./src/config/db");
// Connect to the database
connectDB();

// Apollo Server Setup
const server = new ApolloServer({
  typeDefs: [bookSchema, userSchema],
  resolvers: { 
    Query: { 
      ...bookResolvers.Query, 
      ...userResolvers.Query 
    }, 
    Mutation: { 
      ...bookResolvers.Mutation, 
      ...userResolvers.Mutation 
    } 
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