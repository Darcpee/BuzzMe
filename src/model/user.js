const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    phoneNumber: { type: String, required: true, unique: true },
    pin: { type: String,  required: true  },
    country: {  type: String,  required: true },
    countryCode: { type: String, required: true },
    dialCode: { type: String, required: true },
    userName: { type: String, unique: true,  default: "" },
    // firstName: { type: String, default: "" },
    // lastName: { type: String,  default: "" },
    // bio: { type: String,  default: "" },
    profileImage: { type: String,  default: "" },
    isProfileCompleted: { type: Boolean,  default: false },
    isOnline: { type: Boolean, default: false },
    // lastSeen: { type: Date, default: null }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);

