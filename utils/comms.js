"use strict";

const mailgun = require("mailgun-js");
const nodemailer = require("nodemailer");

const comms = {
  async sendComms(emailRecipient, msg) {
    // send email to recipient
    let subjectLine = "🚨 Stock Alert! 🚨";
    let transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      auth: {
        user: "postmaster@" + process.env.MAILGUN_DOMAIN,
        pass: process.env.MAILGUN_SMTP_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `<crstockalert@${process.env.MAILGUN_DOMAIN}`,
      to: emailRecipient,
      subject: subjectLine,
      text: msg,
    });
    console.log("email sent!");
  },
};

module.exports = comms;
