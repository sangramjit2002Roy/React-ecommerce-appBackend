const mongoose = require(`mongoose`);
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  avatar: {
    public_id: String,
    url: String,
  },
  email: {
    type: String,
    required: [true, "Please Enter an email"],
    unique: [true, "Email Already exists"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Password must be atlease 6 characters"],
    select: false, //`select: false` means when we access the data of the user, then except password we can access all the felds.
  },
  posts: [
    //here is a array of post inside "User"...
    {
      //and here is the "id" of every post is saved... //now we can access the every post of a/any user by this `posts:[]` array
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.pre("save", async function (next) {
  // 1) First it will Listen { "save" } event, after listening { "save" } event...
  // 2) Actually Before saving the password it will hash the password, and after that it will save the hashed password.
  if (this.isModified("password")) {
    // ==>  some text casses or senarios for why I added this "if(){}" condition  <==
    // at first time during registration of an user it will run and hashed the password...
    // but in second time when user update his/her profile then there will be two possibillities - i)user updates email,name with password, ii) user updates email,name and leave the password as it is...
    //in case i) `this.isModified("password")` will retuens true, because user updates the password and the updated password will hashed
    //in case ii) `this.isModified("password")` will retuens false, because user didn't updates the password, and the password will not be hashed
    //That's it 🙃🧠
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
