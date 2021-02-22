const User = require('../models/user');
const Post = require('../models/post');
const { body, validationResult } = require("express-validator");
const Comment = require('../models/comment');

const cookieParser=require('cookie-parser');
exports.getPost = async(req,res)=>{
    const skip = Number(req.query.skip);
    try {
        const loggedInUser = await User.findById(req.user._id);
        const posts = await Post.find(
          { author: [req.user._id, ...loggedInUser.friends] },
          null,
          {
            skip,
            limit: 10,
          }
        )
          .sort({ timestamp: "desc" })
          .populate("author")
          .populate({
            path: "",
            model: "",
            populate: {
              path: "user",
              model: "User",
            },
          });
  
        return res.status(200).json({ posts: posts });
      }catch (err) {
        return res.status(500).json({ error: err.message });
        }
    
};

//Create Post
exports.createPost = async(req,res)=>{
    const { content } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      const newPost = new Post({
        author: req.user._id,
        content: content,
        timestamp: new Date(),
        comment: [],
        likes: [],
      });
      const savedPost = await newPost.save();
      const relPost = await Post.findById(savedPost._id).populate("author");
      if (relPost) {
        return res
          .status(201)
          .json({ message: "Succesfully posted", post: relPost });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
};
//Like Post
exports.likePost = async(req,res)=>{
  try {
    const relPost = await Post.findById(req.params.postId);

    if (!relPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (relPost.likes.includes(req.user._id)) {
      const likesArray = [...relPost.likes];
      const filteredLikesArray = likesArray.filter(
        (userId) => userId != req.user._id
      );
      relPost.likes = filteredLikesArray;
      const updatedPost = await relPost.save();

      return res
        .status(201)
        .json({ message: "Post unliked", post: updatedPost });
    }

    relPost.likes.push(req.user._id);
    const updatedPost = await relPost.save();

    return res.status(201).json({ message: "Post liked", post: updatedPost });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  
}




//Create Comment on post
exports.createComment = async(req,res)=>{
    console.log(req.user)
    const { comment } = req.body;

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const newComment = new Comment({
        user: req.user._id,
        comment: comment,
        timestamp: new Date(),
        post: req.params.postId,
        likes: [],
      });

      const savedComment = await newComment.save();

      const relPost = await Post.findById(req.params.postId);
      relPost.comments.push(savedComment);
      await relPost.save();

      const populatedComment = await Comment.findById(
        savedComment._id
      ).populate("user");
      return res
        .status(201)
        .json({ message: "Comment saved", comment: populatedComment });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
};
