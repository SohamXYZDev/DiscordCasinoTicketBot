const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    // Allow decimals for balance
    set: v => Math.round(v * 100) / 100
  },
  lastDaily: {
    type: Date,
    default: null,
  },
  lastCoinflip: {
    type: Date,
    default: null,
  },
  lastMonthly: {
    type: Date,
    default: null,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: String,
    default: "coins",
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  }
});

module.exports = mongoose.model("User", userSchema);
