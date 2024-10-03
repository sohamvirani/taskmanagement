const nodemailer = require("nodemailer");

const trasporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sohamvirani4865@gmail.com",
    pass: "90877656",
  },
});


async function sendEmail(options) {

const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };
  await trasporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Sent mail successfully");
    }
  });
}
module.exports = sendEmail;
