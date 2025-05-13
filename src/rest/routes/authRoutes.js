const express = require('express');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const User = require ('../../models/User');
const generateToken = require ('../../auth/generateToken');

/**
 * POST /rest/auth/login
 */
authRouter.post ('/login', async (req, res) => {
  const {email, password} = req.body;

  try{
    const user = await User.findOne({email});
    if(!user) return res.status(401).json ({message: 'Invalid email or password'});
   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({message: 'Invalid email or password'});

    const token = generateToken(user);
    
    res.json({token, user: {id: user._id, email: user.email, role: user.role}});


} catch (err){
    console.error(err);
    res.status(500).json({message: 'Server error'});
}
});

module.exports = authRouter;