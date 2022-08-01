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

    const user = await User.findById(req.user._id);//`.findById(req.user._id)` return korey gota user err somosto information gulokey orr I can say gota user taa keey return korey

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
