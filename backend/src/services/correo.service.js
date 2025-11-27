const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendConfirmation(to, subject, body) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: body
  });
}

module.exports = { sendConfirmation };
