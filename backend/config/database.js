//In database.js I created the mongoose server...
//which is helping me to connect to the `URI/URL` that I have inside my `./config/config.env`.

const mongoose = require("mongoose");

module.exports.connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((con) => console.log(`Inside "mongoose.connect() - database.js" Database connected: ${con.connection.host}`))
    .catch((err) => console.log(err));
};
