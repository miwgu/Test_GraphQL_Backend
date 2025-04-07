const jwt = require('jsonwebtoken');

// Secret key for JWT verification, should be stored in an environment variable
const JWT_SECRET = process.env.JWT_SECRET ;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in your environment variables");
}

// Function to authenticate the token
const authenticateToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // Return decoded token which contains user data 
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = authenticateToken;