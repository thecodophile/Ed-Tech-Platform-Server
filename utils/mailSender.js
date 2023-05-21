const nodemailer = require("nodemailer");
require("dotenv").config();

// utility function to send an email
const mailSender = async (email, title, body) => {
  try {
    //transporter object creation,which is used to send the email
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    //send an email using transporter object
    let info = await transporter.sendMail({
      from: "Codophile - by Somnath",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (error) {
    console.log(
      "Error occured in mailSender function while sending mails: ",
      error.message
    );
  }
};

module.exports = mailSender;
