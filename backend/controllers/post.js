const Post = require("../models/Post");
const User = require("../models/User");
exports.createPost = async (req, res) => {
  /*
  console.log(`Comming from post.js::-`);
  console.log(req.user);
  console.log(req.user._id);

  //VeryImportant Note::-
  (*) Jokhon `req` taa asche tokhon `req.user` korley, amra gota user err sob information gulo peye jacchi. 

  //Output is:-
  Comming from post.js::-
  {
    _id: ObjectId('62e80f19942597cc4863e6b6')
    name: "Chirag Bansal"
    avatar: Object
      public_id: "sample_id"
      url: "sampleurl"
    email: "Bansal@gmail.com"
    password: "$2b$10$MJafdf.ZvYWa3JvzL1ZWNO5/Ndt6xh14ejRrlxZNXrMfGLKxZxOv6"
    posts: Array
      0: ObjectId('62e80f52942597cc4863e6b9')
      1: ObjectId('62e80fb57c0cd0588b0419cf')
      2: ObjectId('62e80fd67c0cd0588b0419d4')
      3: ObjectId('62e80fda7c0cd0588b0419d9')
      4: ObjectId('62e80fde7c0cd0588b0419de')
    followers: Array
    __v: 5
  }
  //For more info goto Line No. 66
*/
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

    const user = await User.findById(req.user._id); //`.findById(req.user._id)` return korey gota user err somosto information gulokey orr I can say gota user taa keey return korey

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

/**
 * Note for `exports.createPost = async (req, res) => {}`::--
 *
 * ***Q) amra ekhaney kothao `user` <== define korini, tahole `req.user` err `.user` ta asche kotha thaka?
 *
 * ***Ans:- `user` taa asche hocche '/middlewares/auth.js' thaka
 *
 *
 * ***`auth.js` err vitor :-
 * """req.user = await User.findById(decode._id);""" <== eii line taa lekha achey, taar maney holo `req.user` taa mainly `auth.js` err vitor thaka asche, arr sei jonno ekhaney `req.user` korley gota user err information gulo pere jacchi && `req.user._id` korey user(jey `createPost` request taa marchey) err id taa peye jacchi এবং `owner: req.user._id` korey `Post-mongoose_Model` err `owner` ee current user err id ta dhukiye ditey parchi.
 *
 *
 * sei jonno
 *
 * `/routes/post.js` ee `router.route("/post/upload").post(isAuthenticated,createPost);` `isAuthenticated` naa korey jodi Directly createPost call kori arr sekhaney `req.user._id` taholey `_id is not defined dekhabey` && jodi `req.user` kori tahole seta undefined dekhbey, tarr simple karon holo eta define kora achey `auth.js` ee.
 *
 *
 *
 */

module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    } else {
      //Post taa originally dataBase thaka remove kolam...
      // Kintu akhono ekta kaaj kora baaki achey...
      await post.remove();
      //sei kaaj taa holo `user` err `post` err array thaka `deleted post` err `id` taaoo delete kortey hobey instantly
      const user = await User.findById(req.user._id);
      const index = user.posts.indexOf(req.params.id);
      user.posts.splice(index, 1);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Post is Deleted",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.likes.includes(req.user._id)) {
      //Post jodi like kora thakey, Taholey Seta Dislike kore dicchi
      const index = post.likes.indexOf(req.user._id); // `.indexOf()` holo javaScript ee arrays err ekta method, mainly ekta javaScript Method
      post.likes.splice(index, 1); //`.splice()` etaoo holo ekta javascript method => ekhaney mainly eii .splice() method tarr sahajje oii perticular Liked array taa thaka oii user (jey click korbey like button taay) err ._id taa just delete korchi...
      //more specifically oii user err ._id taa jeey index ee achey sei index taa delete korye dicchi, Taholey oo user taaOO delete hoye jacchey

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Unliked",
      });
    } else {
      //Post jodi like kora naa thakey taholey Only like korchi.
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post Liked",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.follow_and_unFollow_User = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    console.log(userToFollow);
    const loggedInUser = await User.findById(req.user._id); //`loggedInUser` maney jeey request taa korchey

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: `In Line no. 171::==>"User not found"`,
      });
    } else if (loggedInUser.following.includes(userToFollow._id)) {
      //`loggedInUser` jee request taa korceh, see jodi already follow korey-thake `userToFollow` keey taholey sei user taa unfollow hoye jabey abar same button ee click korley...
      //Setaii ekhaney check kora hocche.
      const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
      loggedInUser.following.splice(indexFollowing, 1);

      const indexFollowors = userToFollow.followers.indexOf(loggedInUser._id);
      userToFollow.followers.splice(indexFollowors, 1);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        messsage: "User UnFollowed",
      });
    } else {
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();
      return res.status(200).json({
        success: true,
        messsage: "User Followed",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `From FollowUser TRyCatch ${err.message}`,
    });
  }
};

module.exports.getPostOfFollowing = async (req, res) => {
  try {
    /**
        const user = await User.findById(req.user._id);
          return res.status(200).json({
              success: true,
              user,
          });

          // etii code taar outPut holo
          {
            "success": true,
            "user": {
                "avatar": {
                    "public_id": "sample_id",
                    "url": "sampleurl"
                },
                "_id": "62ff37bcb8a8b4a44bb72c2d",
                "name": "Jhantoo Bansal",
                "email": "jhantoo@gmail.com",
                "posts": [],
                "followers": [],
                "following": [
                    "62ff2b5777cceec199dc08b7"
                ],
                "__v": 15
            }
        }

        //But 
        const user = await User.findById(req.user._id).populate("following"); //.populate("following") <== etaa use korley `folloeing array` tey mongodb puro user define korey diye diyeche...
        //maney...
        following": [
                    "62ff2b5777cceec199dc08b7"
                ], 
        //eta rr jaygay...
        "following": [
            {
                "avatar": {
                    "public_id": "sample_id",
                    "url": "sampleurl"
                },
                "_id": "62ff2b5777cceec199dc08b7",
                "name": "Chirag Bansal",
                "email": "bansal@gmail.com",
                "posts": [],
                "followers": [
                    "62ff37bcb8a8b4a44bb72c2d"
                ],
                "__v": 11,
                "following": []
            }
        ],
        //eta debey.
     */
    /**
     */
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      // eii owner err senario taa holo erom jey...
      //ownerId ditey hobey ekhaney 1taa, kintu amader kachey puro following array rr list achey (at line no. 275), taholey seta kikorey debo?
      //Ans::-
      //For this type of senario we have an `operator` in mongodb
      //that operator is [ $in: user.following ]

      owner: {
        $in: user.following, // ($in:) method puro array taa ney, arr nijey ee array r elements match korey Jetay lagbey/match korbey seta return korey.
      },
    });
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `From getPostOfFollowing TRyCatch ${err.message}`,
    });
  }
};

module.exports.logout = (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Logged out",
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    post.caption = req.body.caption;
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
