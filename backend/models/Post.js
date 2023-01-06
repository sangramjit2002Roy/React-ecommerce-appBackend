const mongoose = require(`mongoose`);

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    max: 20,
  },
  image: {
    public_id: String,
    url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, //mongodb will check at it's own...
    ref: "User", //inside the the `User.js` schema or model field...
    //and put the `ObjectId` to the correponding user, that we can verify if it is the original
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      //inside `like:[]` array, the objectId of that `user` will be saved, who likes my post.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //the 'id' come into the user that will be the `id` of 'User from User.js'
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);
