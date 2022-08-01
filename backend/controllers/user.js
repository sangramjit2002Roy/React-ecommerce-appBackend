const User = require("../models/User");

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
    const token = await user.generateToken(); ////eii `.matchPassword();` function taa user_Define function taai eta amakeii banatey hobe, eii function taa baniyechi `mongoose-models` ee
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
