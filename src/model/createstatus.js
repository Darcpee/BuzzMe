const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({

    text: { type: String, required: true },
    image: { type: String },
    video: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User"}

}, {
    timestamps: true
});

module.exports = mongoose.model( "Status", statusSchema );