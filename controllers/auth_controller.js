const bcrypt = require("bcryptjs");
const User = require("../models/user_model");
const sendMail = require("./mail_controller");

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.name - The name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.cpassword - The confirmation password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is registered.
 */
const register = async (req, res) => {
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res.status(400).json({ success: false, message: "Sorry a user with this email already exists" });
  }
  if (req.body.password != req.body.cpassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      otp: {
        id: Math.floor(100000 + Math.random() * 900000),
        expiredAt: new Date(new Date().getTime() + 5 * 60000)
      }
    });

    await sendMail("Doux Event", user.email, "Email Verification", `<h1>Hi ${user.name},</h1><p>Your OTP is ${user.otp.id}</p>`);
    await user.save();
    res.status(201).send({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(404).send({ success: false, message: "User registration failed", error: error });
  }
}

/**
 * Verifies the user's email using the provided OTP.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email address to verify.
 * @param {string} req.body.otp - The OTP provided for verification.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response with the verification result.
 */
const verifyEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp?.trim();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ success: false, message: "Invalid Email" });
    }
    // if (user.emailVerified) {
    //   return res.status(400).send({ success: false, message: "Email already verified" });
    // }
    if (user.otp.id == otp && user.otp.expiredAt > new Date()) {
      user.emailVerified = true;
      await user.save();
      res.status(200).send({ success: true, message: "Email verified successfully" });
    } else {
      res.status(400).send({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: "Email verification failed", error: error });
  }
}

/**
 * Resends an OTP to the user's email for verification.
 *
 * @async
 * @function resendOtp
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user requesting the OTP.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with the status and message of the OTP resend operation.
 */
const sendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ success: false, message: "User doesn't exist" });
    }
    user.otp = {
      id: Math.floor(100000 + Math.random() * 900000),
      expiredAt: new Date(new Date().getTime() + 5 * 60000)
    }
    await sendMail("Doux Event", user.email, "Email Verification", `<h1>Hi ${user.name},</h1><p>Your OTP is ${user.otp.id}</p>`);
    await user.save();
    res.status(200).send({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to send OTP", error: error });
  }
}

/**
 * Handles user login.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - If there is an error during the login process.
 */
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ success: false, message: "Invalid Email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (!user.emailVerified) {
        user.otp = {
          id: Math.floor(100000 + Math.random() * 900000),
          expiredAt: new Date(new Date().getTime() + 5 * 60000)
        }
        await sendMail("Doux Event", user.email, "Email Verification", `<h1>Hi ${user.firstName},</h1><p>Your OTP is ${user.otp.id}</p>`);
        await user.save();
        return res.status(400).send({ success: false, message: "Email not verified", data: { email: user.email, name: user.name } });
      }
      const token = await user.generateAuthToken();
      const { password, otp, tokens, ...userData } = user._doc;
      res.status(200).json({ success: true, message: "User logged in successfully", data: { user: userData, accessToken: token } });
    } else {
      res.status(400).json({ success: false, message: "Invalid Password" });
    }
  }
  catch (error) {
    res.status(400).json({ success: false, message: "User login failed", error: error });
  }
}

/**
 * Resets the password for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The new password for the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the password is reset.
 */
const resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }
        user.password = req.body.password;
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to reset password", error: error });
    }
}

/**
 * Handles guest user login.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.browserId - The browser ID of the guest user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const guestLogin = async (req, res) => {
  const browserId = req.body.browserId;
  if (!browserId) {
    return res.status(400).json({ success: false, message: "Browser ID is required" });
  }
  const userExist = await User.findOne({ browserId });
  if (userExist) {
    const token = await userExist.generateAuthToken();
    const { password, otp, tokens, ...userData } = userExist._doc;
    return res.status(200).json({ success: true, message: "Guest user logged in successfully", data: { user: userData, accessToken: token } });
  }
  try {
    const user = new User({
      name: "Guest" + Math.floor(1000 + Math.random() * 9000),
      isGuest: true,
      browserId: browserId
    });
    const token = await user.generateAuthToken();
    const { password, otp, tokens, ...userData } = user._doc;
    res.status(200).json({ success: true, message: "Guest user logged in successfully", data: { user: userData, accessToken: token } });
  } catch (error) {
    res.status(400).json({ success: false, message: "Guest user login failed", error: error });
  }
}

/**
 * Fetches the profile details of the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user._id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - If there is an error fetching the user profile details.
 */
const profileDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -tokens");
    res.status(200).json({ success: true, message: "User profile details fetched successfully", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to fetch user profile details", error: error });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  resetPassword,
  sendOtp,
  profileDetails,
  guestLogin
};