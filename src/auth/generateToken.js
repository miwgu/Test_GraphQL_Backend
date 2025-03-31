const jwt = require("jsonwebtoken");

// Secret key for JWT verification, should be stored in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

// Function to generate the JWT token
const generateToken = (user) => {
  // Create a token with user data and an expiration time
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username, 
      role: user.role,
    }, // payload
    JWT_SECRET, // secret key
    { expiresIn: "1h" } // expiration time
  );
  return token;
};

module.exports = generateToken ;
