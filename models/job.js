const mongoose = require("mongoose");


const jobSchema = new mongoose.Schema(
{
title: {
type: String,
required: true,
},


description: {
type: String,
required: true,
},


skills: {
type: [String],
required: true,
},


salary: {
type: String,
},


postedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
},
{ timestamps: true }
);


module.exports = mongoose.model("Job", jobSchema);