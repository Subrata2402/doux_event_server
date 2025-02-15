const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");

/**
 * User Schema
 * 
 * @typedef {Object} User
 * @property {string} name - The name of the user. This field is required.
 * @property {string} [email] - The email of the user. This field is optional.
 * @property {boolean} [emailVerified=false] - Indicates if the user's email is verified. Defaults to false.
 * @property {string} [password] - The password of the user. This field is optional.
 * @property {string} [browserId] - The browser ID associated with the user. This field is optional.
 * @property {boolean} [isGuest=false] - Indicates if the user is a guest. Defaults to false.
 * @property {Object} [otp] - The OTP (One-Time Password) information.
 * @property {number} [otp.id] - The OTP ID. This field is optional.
 * @property {Date} [otp.expiredAt] - The expiration date of the OTP. This field is optional.
 * @property {Array.<Object>} tokens - The tokens associated with the user.
 * @property {string} tokens.token - The token string. This field is required.
 * @property {Date} createdAt - The timestamp when the user was created.
 * @property {Date} updatedAt - The timestamp when the user was last updated.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: false
  },
  browserId: {
    type: String,
    required: false
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  otp: {
    id: {
      type: Number,
      required: false
    },
    expiredAt: {
      type: Date,
      required: false
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, { timestamps: true });

userSchema.methods.generateAuthToken = async function () {
  const secret = fs.readFileSync("./keys/private.key", "utf8");
  try {
    const token = jwt.sign({ _id: this._id.toString() }, secret, { expiresIn: '1d', algorithm: 'RS256' });
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
}

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;