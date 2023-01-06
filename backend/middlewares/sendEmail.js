const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  // const transporter = nodeMailer.createTransport({
  //   host: process.env.SMPT_HOST, // for gmail ami onno kichu use kortey chailey seta google ee find korey nitey hobey
  //   port: process.env.SMPT_PORT,
  //   auth: {
  //     user: process.env.SMPT_MAIL, //ekhaney amar mail
  //     pass: process.env.SMPT_PASSWORD, //arr amar mail err password lagbey
  //   },
  //   service: process.env.SMT_SERVICE
  // });
  var transport = nodeMailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ad0163355e14a9",
      pass: "d6ff82dfbd8870",
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //   await transporter.sendMail(mailOptions);
  await transport.sendMail(mailOptions);
};
