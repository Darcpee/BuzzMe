const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },

    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, default:"" },
     messageType: {

            type: String,

            enum: [

                "text",
                "image",
                "video",
                "audio"

            ],

            default: "text"

        },
    imageUrl: {type: String, default: null},
    videoUrl: {type: String, default: ""},
    audioUrl: {type: String, default: null},
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedForEveryone: { type: Boolean, default: false },
    status:{
        type:String,
        enum:["sent","delivered","seen"],
        default:"sent"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Message", messageSchema);