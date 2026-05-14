const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mini-posts-db");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  age: Number,
  password: String,
  profilePic: {
    type: String,
    default: "default.png",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
