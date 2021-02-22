const mongoose = require("mongoose");
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const salt=10;
const confiq=require('../config/config').get(process.env.NODE_ENV);

var Schema = mongoose.Schema;

var userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  password2:{type:String,required: true,minlength:5},
  profilePicUrl: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  // comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  
});


userSchema.pre('save',function(next){
  var user=this;
  
  if(user.isModified('password')){
      bcrypt.genSalt(salt,function(err,salt){
          if(err)return next(err);

          bcrypt.hash(user.password,salt,function(err,hash){
              if(err) return next(err);
              user.password=hash;
              user.password2=hash;
              next();
          })

      })
  }
  else{
      next();
  }
});

//to login
userSchema.methods.validatePassword=function(password,cb){
  return bcrypt.compare(password, user.password);

}

// generate token

userSchema.methods.generateToken=async function(){
  const user =this;
  const token=jwt.sign(user._id.toHexString(),confiq.SECRET);
  user.token=token;
  user.tokens = user.tokens.concat({token});
  await user.save()
  return token
};

// find by token
userSchema.statics.findByToken=function(token,cb){
  var user=this;
  jwt.verify(token,confiq.SECRET,function(err,decode){
      console.log(decode)
      console.log(token)
      user.findOne({"_id": decode, "token":token},function(err,user){
          if(err) return cb(err);
          cb(null,user);
      })
  })
};

//delete token

userSchema.methods.deleteToken=function(token,cb){
  var user=this;

  user.update({$unset : {token :1}},function(err,user){
      if(err) return cb(err);
      cb(null,user);
  })
}


//Export model
module.exports = mongoose.model("User", userSchema);