const Post = require("../models/Post");
const User = require("../models/User");
exports.createPost = async (req, res) => {
  try {
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: "req.body.public_id",
        url: "req.body.url",
      },
      owner: req.user._id, //automatically user(jey create korlo post ta taar id) err id ` _id: ObjectId('62e2af6186c06b5fbd91be71')` <== eta owner err moddhey save hoye jabey """req.user._id""" eta use korechi boley.
    };

    /* These 3-lines are very important to underStand */
    const newPost = await Post.create(newPostData); //go to (`/models/User.js`) err `line no. 25 post:[]` array tey....
    //ekhaney notun post Just create holo, seii post err ` _id: ObjectId('62e2af6186c06b5fbd91be71')` taa key tww push oo kortey hobey {_(`/models/User.js`) err `line no. 25 post:[]` array tey_}...
    const user = await User.findById(req.user._id); //moddi_Khaney Post taa je korechey(user err `id`) {or alternatively} I can say owner err ` _id: ObjectId('62e2af6186c06b5fbd91be71')` taa user ee save hoye jacchey

    //oii `user` err corresponding `posts` array tey `notun created post` err id taa `push()` korey decchi, jatey perticular ekta user err somosto post access kortey pari.
    user.posts.push(newPost._id); //setaii push korchi ekhany

    await user.save();
    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
