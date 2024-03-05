const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, verificationToken) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'infoankitkumar6@gmail.com',
      pass: 'hjbj qxzc eqam uryg', // replace with your Gmail  App Password
    },
  });

  const verificationLink = `http://localhost:3080/auth/verify?token=${verificationToken}`;
  const mailOptions = {
    from: 'infoankitkumar6@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Click on the link to verify your email: ${verificationLink}`,
  };

  await transporter.sendMail(mailOptions);
}



async function sendResetPasswordLink(emailForResetPass, verificationTokenForResetPass) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'infoankitkumar6@gmail.com',
      pass: 'hjbj qxzc eqam uryg', // to be replaced with your Gmail  App Password
    },
  });

 
  const ResetPasswordLink = `http://localhost:3080/auth/reset?email=${emailForResetPass}&token=${verificationTokenForResetPass}`;
  const mailOptions = {
    from: 'infoankitkumar6@gmail.com',
    to: emailForResetPass,
    subject: 'Reset password',
    text: `Click on the link to rset your password: ${ResetPasswordLink}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendResetPasswordLink };