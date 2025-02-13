const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const fs = require('fs');

/**
 * Middleware function to authenticate user based on token.
 * @param {Object} req - The request object.
 * @param {Object} req.header - The request header object.
 * @param {string} req.header.Authorization - The authorization header.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Promise that resolves when authentication is successful or rejects with an error.
 */
const authenticate = async (req, res, next) => {
    const secret = fs.readFileSync("./keys/public.key", "utf8");
    try {
        const token = req.header('Authorization')?.replace('Bearer', '').trim();
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }
        const verifyUser = jwt.verify(token, secret, { algorithm: 'RS256' });
        const user = await User.findOne({ _id: verifyUser._id }).select({ password: 0, tokens: 0, otp: 0 });
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token", error: error });
    }
}

module.exports = authenticate;