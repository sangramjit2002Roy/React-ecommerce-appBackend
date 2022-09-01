const express = require("express");
const {
  createPost,
  likeAndUnlikePost,
  deletePost,
  getPostOfFollowing,
  updateCaption,
} = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, createPost); //note:: `.post(handelers,handelers,....)` ==> jotogulo iccha handeler banatey pari inside `.post()` ==>just remenber jee handeler taa agey likhbo seta agey execute korbey maney ekhaney for this exmple `isAuthenticated` agey execute korbey Jodi User authenticated thakey taholey ee takey `post-create` kortey deoa hobey.

router
  .route("/post/:id")
  .get(isAuthenticated, likeAndUnlikePost)
  .put(isAuthenticated, updateCaption)
  .delete(isAuthenticated, deletePost);

router.route("/posts").get(isAuthenticated, getPostOfFollowing);

module.exports = router;
