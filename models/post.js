const mongoose = require("mongoose");
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const salt=10;
const confiq=require('../config/config').get(process.env.NODE_ENV);
const { format } = require("date-fns");

var Schema = mongoose.Schema;

var PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String,required: true},
    timestamp: { type: Date, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    imgUrl: { type: String, required: false },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  });
  
  PostSchema.virtual("formatted_time").get(function () {
    return format(new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm");
  });
//Export model
module.exports = mongoose.model("Post", PostSchema);