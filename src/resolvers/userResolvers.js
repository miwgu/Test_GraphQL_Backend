const bcrypt = require("bcryptjs");
const generateToken = require("../auth/generateToken");
const User = require("../models/User");

const userResolvers = {
  Query: {
    /**
     * Fetch all users if the authenticated user is an ADMIN.
     * Regular users do not have access.
     *
     * @param {*} _ - Parent resolver (not used)
     * @param {*} __ - Arguments passed to the query (not used)
     * @param {*} context - Context object containing the authenticated user
     * @returns {Array} List of users if ADMIN, otherwise throws an error
     */
    users: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      if (user.role !== "ADMIN") {
        return new Error("Authentication required");
      }

      return await User.find(); // Fetch all users if role is ADMIN
    },
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Authentication required");
      }
      return user; // Return user data from the context
    },
  },
  Mutation: {
    createUser: async (_, { username, email, password, role }) => {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await user.save();

      return user;
    },
    login: async (_, { email, password }) => {
      console.log("Received email from GraphQL:", email); // Debugging

      // Fetch all users from the database
      const allUsers = await User.find();
      console.log("All Users in DB:", allUsers); // Debugging

      // Find the user by email
      console.log("Querying database for email:", email);
      const user = await User.findOne({ email });

      console.log("User found:", user); // Debugging

      if (!user) {
        throw new Error("User not found!");
      }

      // Compare the entered password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("PasswordValid", isPasswordValid);

      if (!isPasswordValid) {
        throw new Error("Invalid password!");
      }

      // Generate JWT token
      const token = generateToken(user);
      console.log("Token", token);

      return {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    },
  },
};

module.exports = userResolvers;
