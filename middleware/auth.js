const jwt = require("jsonwebtoken");
const User = require('../models/user');

const confiq=require('../config/config').get(process.env.NODE_ENV);

const auth = async(req, res, next) => {
    const token = req.header('Authorization')
        
    //console.log(req.header('Authorization'))
    //   const token = req.header('Authorization').replace('Bearer ', '');
  
  const data = jwt.verify(token,confiq.SECRET);
  
  try {
    const user = await User.findOne({ _id: data, 'tokens.token': token });
    console.log(user)
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next()
  } catch (error) {
    res.status(401).send({ error: 'Not authorized to access this resource' });
  }
}

module.exports = {auth};
