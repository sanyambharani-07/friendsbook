const express = require('express');
const router = new express.Router();
const {auth} =require('../middleware/auth');
const { check, body, validationResult } = require("express-validator");


const { userSignup, userSignin, userSignout,users,userProfile,searchUser,editProfile,createPicture } = require('../controller/user');
const {requestFriend,acceptFriendInvitation,rejectFriendInvitation,unfriend,withdrawRequest} = require('../controller/friends');
router.post('/signup', userSignup);
router.post('/signin',userSignin);
router.get('/signout',auth,userSignout);
router.post('/search',auth,searchUser);

router.get('/',auth,users);
router.get('/:userId',auth,userProfile);
router.put('/:userId', auth, editProfile);
// router.post('/:userId/profileimage',body("imageFile")
// .custom((value, { req }) => {
//   if (!req.file) {
//     return "No image";
//   } else if (
//     req.file.mimetype === "image/bmp" ||
//     req.file.mimetype === "image/gif" ||
//     req.file.mimetype === "image/jpeg" ||
//     req.file.mimetype === "image/png" ||
//     req.file.mimetype === "image/tiff" ||
//     req.file.mimetype === "image/webp"
//   ) {
//     return "image"; // return "non-falsy" value to indicate valid data"
//   } else {
//     return false; // return "falsy" value to indicate invalid data
//   }
// })
// .withMessage("You may only submit image files."),createPicture);

router.post('/friends/req',auth, requestFriend);
router.put('/friends/accept', auth, acceptFriendInvitation);
router.delete('/friends/cancel',auth,withdrawRequest);
router.delete('/friends/decline',auth,rejectFriendInvitation);
router.delete('/friends/remove',auth,unfriend);

module.exports = router;