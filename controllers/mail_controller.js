const nodemailer = require("nodemailer");

/**
 * Sends an email using the nodemailer library.
 *
 * @param {string} senderId - The ID of the sender.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} subject - The subject of the email.
 * @param {string} content - The HTML content of the email.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
const sendMail = async (senderId, receiverId, subject, content) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: senderId + " <" + process.env.EMAIL_HOST + ">",
      to: receiverId,
      subject: subject,
      html: content,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendMail;