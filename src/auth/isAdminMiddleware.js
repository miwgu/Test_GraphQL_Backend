const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.role === "ADMIN") {
      return next(); // if role is Admin next process
    }
    return res.status(403).json({ error: "Unauthorized. You are not Admin!" }); // Adminでない場合はアクセス拒否
  };
  
  module.exports = isAdmin;