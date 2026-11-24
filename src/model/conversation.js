const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(

    {

        participants: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "User",

                required: true

            }

        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message"
            }
        ],

        lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },

        lastMessageText: { type: String, default: "" },
        lastMessageTime: {  type: Date,  default: Date.now }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);