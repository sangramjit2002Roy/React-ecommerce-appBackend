const User = require("../models/User");

const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies; // npm i cookie-parser, for parsing the token from the cookie
    // console.log(`This is req from (/middlewaers/auth.js)::--`);
    // console.log(req.cookies);
    // console.log(`This is token from (/middlewaers/auth.js)::--`);
    // console.log(token);
    if (!token) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log(`This is decode from (/middlewaers/auth.js)::--`);
    // console.log(`comming from auth.js::-`);
    // console.log(decode);
    // console.log(decode._id);

    req.user = await User.findById(decode._id);

    /*
    console.log(`req.user`);
    console.log(req.user);
    */

    next(); // <-- I finished this function by calling `next();`
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
