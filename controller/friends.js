const User = require('../models/user');

const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");



// @desc      Register user
// @route     POST /api/user/requestFriend
// @access    Private
exports.requestFriend = async (req, res) => {
    const relUserId  = req.body;
    try {
      const relUser = await User.findById(relUserId.relUserId);
      
      // check requesting user is not the same as the relevant user
      if (relUser._id == req.user._id) {
        return res.status(400).json({ message: "You cannot friend yourself" });
      }

      // check that the requesting user is not already a friend of the relevant user
      if (relUser.friends.includes(req.user._id)) {
        return res
          .status(400)
          .json({ message: "You are already a friend of this user" });
      }

      // check that the requesting user has not already sent a friend request
      if (relUser.friendRequests.includes(req.user._id)) {
        return res.status(400).json({
          message: "You have already sent a friend request to this user",
        });
      }
      // push the requesting user's id to the relevant user's friendRequests array
      const updatedFriendReqs = [...relUser.friendRequests, req.user._id];
      relUser.friendRequests = updatedFriendReqs;
      const updatedUser = await relUser.save();
      return res
        .status(201)
        .json({ message: "Friend request submitted", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

};

// @desc      Sign in user
// @route     POST /api/v1/auth/signin
// @access    Public
exports.acceptFriendInvitation = async (req, res) => {
  const { relUserId } = req.body;
  try {
    const relUser = await User.findById(relUserId);
    const acceptingUser = await User.findById(req.user._id);
    //console.log(relUser)
    console.log(acceptingUser)
    console.log(relUser)
    // check that accepting user has a friend request from relevant user
    if (!acceptingUser.friendRequests.includes(relUserId)) {
      return res.status(400).json({
        message: "Friend request not found",
      });
    }
    console.log(relUser)
    
    const updatedFriendReqs = acceptingUser.friendRequests.filter(
      (friendReq) => friendReq != relUserId
    );
    acceptingUser.friendRequests = updatedFriendReqs;
    const updatedFriends = [...acceptingUser.friends, relUserId];
    acceptingUser.friends = updatedFriends;
    const updatedUser = await acceptingUser.save();

    const updatedRelUserFriends = [...relUser.friends, req.user._id];
    relUser.friends = updatedRelUserFriends;
    await relUser.save();

    const populatedUser = await User.findById(updatedUser._id).populate(
      "friends"
    );

    return res
      .status(201)
      .json({ message: "Friend request accepted", user: populatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
   
};
exports.rejectFriendInvitation = async(req,res)=>{
  const { relUserId } = req.body;

  try {
    const relUser = await User.findById(req.user._id);

    const updatedFriendReqs = relUser.friendRequests.filter(
      (item) => item._id != relUserId
    );
    relUser.friendRequests = updatedFriendReqs;
    const updatedUser = await relUser.save();

    return res
      .status(201)
      .json({ message: "Friend request declined", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


exports.unfriend = async(req,res)=>{
  const { relUserId } = req.body;
  
  try {
    const relUser = await User.findById(relUserId);

    // delete from user's friends list
    const updatedFriends = relUser.friends.filter(
      (item) => item._id != String(req.user._id)
    );
    
    relUser.friends = updatedFriends;
    
    await relUser.save();

    // delete from logged in user's friends list
    const loggedInUser = await User.findById(req.user._id);
    
    const loggedInUserUpdatedFriends = loggedInUser.friends.filter(
      (item) => String(item) != String(relUserId)
    );
    // console.log(loggedInUserUpdatedFriends)
    loggedInUser.friends = loggedInUserUpdatedFriends;
    await loggedInUser.save();

    return res.status(201).json({
      message: "Friend removed",
      user: relUser,
      // loggedInUser: loggedInUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
exports.withdrawRequest  = async(req,res)=>{
  const { relUserId } = req.body;
    
    try {
      const relUser = await User.findById(relUserId);
      // check requesting user is not the same as the relevant user
      if (!relUser.friendRequests.includes(req.user._id)) {
        return res.status(404).json({ message: "Friend request not found." });
      }

      // delete the request
      const updatedRequests = relUser.friendRequests.filter(
        (user) => user != String(req.user._id)
      );
    
      relUser.friendRequests = updatedRequests;
      const updatedUser = await relUser.save();

      return res
        .status(200)
        .json({ message: "Friend request deleted", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
}
// @desc      Sign out user
// @route     get /api/v1/auth/signout
// @access    Private
