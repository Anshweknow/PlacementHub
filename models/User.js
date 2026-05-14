const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: true,
    },
    role: {
      type: String,
      enum: ["student", "hr"],
      default: "student",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
