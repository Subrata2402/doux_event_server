const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");

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