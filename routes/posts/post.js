const express = require('express');
const router = new express.Router();
const {auth} =require('../../middleware/auth');

const { createPost,getPost,likePost,createComment} = require('../../controller/post');



router.post('/',auth, createPost);

router.get('/',auth,getPost);
router.put('/:postId/like',auth,likePost);
router.post('/:postId/comments',auth,createComment);

module.exports = router;