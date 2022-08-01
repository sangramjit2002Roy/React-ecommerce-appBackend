const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

//Using middkewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //go to `/middlewares/auth.js` ""line no.7"" to see the Use of `cookieParser`

// Importing Routes
const createPostRouter = require("./routes/post");
const createUserRouter = require("./routes/user");

//Using Routes
app.use("/api/v1", createPostRouter);
app.use("/api/v1", createUserRouter);

module.exports = app;
