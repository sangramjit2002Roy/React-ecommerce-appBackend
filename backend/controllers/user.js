const User = require("../models/User");
const Post = require("../models/Post");

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // let user = await User.findOne({ email: email });
    let user = await User.findOne({ email });
    // console.log(user);
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already created" });
    }
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "sample_id",
        url: "sampleurl",
      },
    });
    /*  res.status(201).json({ success: true, user }); <-- eta just only for Register */
    /* ********* xxxxx ********* */
    /* But ekhaney Register err sathey sathey ee user kee login oo koreiye debo taai nicher code gulo likhlam */
    const token = await user.generateToken();
    const options = {
      expires: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ) /* days * hours * minutes * sec * millisecond ==> "90" maney 90 days pore expire korey jabey*/,
      httpOnly: true, //httpOnly is just for security reasons
    };
    res.status(201).cookie("token", token, options).json({
      //`status(201)` status code `201` maney created
      success: true,
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password"); //models ee password `select: false` kora achey boley, ekhaney .select("password"); korey rekhechi

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User denot exists",
      });
    }

    const isMatch = await user.matchPassword(password); //eii `.matchPassword();` function taa user_Define function taai eta amakeii banatey hobe, eii function taa baniyechi `mongoose-models` ee

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = await user.generateToken(); ////eii `.matchPassword();` function taa user_Define function taai eta amakeii banatey hobe, eii function taa baniyechi `mongoose-models` ee
    const options = {
      expires: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ) /* days * hours * minutes * sec * millisecond ==> "90" maney 90 days pore expire korey jabey*/,
      httpOnly: true, //httpOnly is just for security reasons
    };
    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      // jodi key old arr new password naa dey
      return res.status(400).json({
        success: false,
        message: "Please Provide Old and new password",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old Password",
      });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email } = req.body;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }

    // User Avatar:TODO

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const following = user.following;
    const userId = user._id;

    // // Removing Avatar from cloudinary
    // await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    // Logout user after deleting profile

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // Delete all posts of the user
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      // await cloudinary.v2.uploader.destroy(post.image.public_id);
      await post.remove();
    }

    // Removing User from Followers Following
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);

      //jara `amakey` follow korchey tader `folliwings` err `array` thaka amar `userId` taa `delete` kortey chaichi
      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // Removing User from Following's Followers
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);

      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    // removing all comments of the user from all posts
    const allPosts = await Post.find();

    for (let i = 0; i < allPosts.length; i++) {
      const post = await Post.findById(allPosts[i]._id);

      for (let j = 0; j < post.comments.length; j++) {
        if (post.comments[j].user === userId) {
          post.comments.splice(j, 1);
        }
      }
      await post.save();
    }
    // removing all likes of the user from all posts

    for (let i = 0; i < allPosts.length; i++) {
      const post = await Post.findById(allPosts[i]._id);

      for (let j = 0; j < post.likes.length; j++) {
        if (post.likes[j] === userId) {
          post.likes.splice(j, 1);
        }
      }
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "posts followers following"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
