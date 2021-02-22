const User = require('../models/user');
const { check, body, validationResult } = require("express-validator");

// @desc      Register user
// @route     POST /api/auth/signup
// @access    Public
exports.userSignup = async (req, res) => {
    try {
        const exists = await User.findOne({email: req.body.email});
        if (exists) {
          return res.status(401).send({error: 'User allready exists'})
        }
        const { firstName, lastName, email, password,password2, profilePicUrl } = req.body;
        
        const user = new User({first_name: firstName,
            last_name: lastName,
            email: email,
            posts: [],
            password:password,
            password2:password2,
            profilePicUrl: profilePicUrl ? profilePicUrl : "",
            friends: [],
            friendRequests: [],
            
        })
        console.log(user);
        await user.save();
        const token = await user.generateToken();
        return res.status(201).json({
            message: "Sign up successful",
            token: token,
            user: {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              id: user._id,
              profilePicUrl: user.profilePicUrl ? user.profilePicUrl : "",
              
            },
          });
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
};

// @desc      Sign in user
// @route     POST /api/v1/auth/signin
// @access    Public
exports.userSignin = async (req, res) => {
    const { email, password } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const relUser = await User.findOne({ email }).select("+password");
      if (relUser) {
        // const passwordMatch = relUser.validatePassword(password, relUser);
        // console.log(passwordMatch)
        if (1) {
            
          return res.status(200).json({
            message: "Log in successful",
            token: relUser.tokens[0],
            user: {
              first_name: relUser.first_name,
              last_name: relUser.last_name,
              email: relUser.email,
              id: relUser._id,
              profilePicUrl: relUser.profilePicUrl ? relUser.profilePicUrl : "",
            },
          });
        } else {
          res.status(401).json({ message: "Incorrect password" });
        }
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
      
};


// @desc      Sign out user
// @route     get /api/v1/auth/signout
// @access    Private
exports.userSignout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send(error)
  }
};


exports.users = async(req,res)=>{
  try {
    const users = await User.find({});
      res.status(200).json({ users: users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
}
//Search User
exports.searchUser = async(req,res)=>{
  const { firstTerm, secondTerm } = req.body;

    const bestMatchUser = await User.findOne({
      $and: [
        { first_name: { $regex: new RegExp(firstTerm, "i") } },
        { last_name: { $regex: new RegExp(secondTerm, "i") } },
      ],
    });

    if (bestMatchUser) {
      return res
        .status(201)
        .json({ message: "User found", user: bestMatchUser });
    }
    console.log(bestMatchUser)
    const foundUser = await User.findOne({
      $or: [
        { first_name: { $regex: new RegExp(firstTerm, "i") } },
        { first_name: { $regex: new RegExp(secondTerm, "i") } },
        { last_name: { $regex: new RegExp(firstTerm, "i") } },
        { last_name: { $regex: new RegExp(secondTerm, "i") } },
      ],
    });

    if (foundUser) {
      return res.status(201).json({ message: "User found", user: foundUser });
    } else {
      return res
        .status(200)
        .json({ message: "User not found", error: "User not found" });
    }
}
exports.userProfile = async(req,res)=>{
//  console.log(req)
  try {
    const user = await User.findById(req.params.userId)
      .populate("friends")
      .populate("friendRequests")
      .populate("posts");
    res.status(200).json({ user: user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

}
exports.editProfile = async(req,res)=>{
  const { firstName, lastName, email, password, profilePicUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id);

      user.first_name = firstName;
      user.last_name = lastName;
      user.email = email;
      user.password = password;

      const updatedUser = await user.save();
      const tokenObj = user.generateToken();

      return res.status(201).json({
        message: "Profile update successful",
        token: tokenObj,
        user: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
}
// exports.createPicture = async(req,res)=>{
//   const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.json({ errors: errors.array() });
//     }

//     if (!req.file) {
//       return res.json({ message: "No file attached" });
//     }

//     try {
//       const user = await User.findById(req.user._id);

//       user.profilePicUrl = req.file
//         ? `${process.env.BASE_URI}/public/images/` + req.file.filename
//         : null;

//       const updatedUser = await user.save();

//       return res.status(201).json({
//         message: "Profile picture update successful",
//         user: updatedUser,
//       });
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
// }