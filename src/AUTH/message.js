const Message = require("../model/message");
const Conversation = require("../model/conversation");
const { users } = require("../sockets/socket");

// ============================================
// SEND MESSAGE
// ============================================

exports.sendMessage = async (req, res) => {
    try {

        const sender = req.user.id;

        const { receiver, text } = req.body;

        // Validate incoming data
        if (!receiver || !text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Receiver and message are required."
            });
        }

        // Find existing conversation
        let conversation = await Conversation.findOne({
            participants: {
                $all: [sender, receiver]
            }
        });

        // Create conversation if it doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [sender, receiver]
            });
        }

        // Save message
        const newMessage = await Message.create({
            conversation: conversation._id,
            sender,
            receiver,
            message: text.trim(),
            messageType: "text"
        });

        // Update conversation
        conversation.lastMessage = newMessage._id;
        conversation.lastMessageText = newMessage.message;
        conversation.lastMessageTime = new Date();

        await conversation.save();

        return res.status(201).json({
            success: true,
            data: newMessage
        });

    } catch (error) {

        console.error("SEND MESSAGE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// GET ALL MESSAGES BY CONVERSATION
// ============================================

exports.getMessages = async (req, res) => {

    try {

        const messages = await Message.find({

            conversation: req.params.id

        })

            .populate(

                "sender",

                "userName profileImage"

            )

            .sort({

                createdAt: 1

            });

        return res.status(200).json({

            success: true,

            messages

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ============================================
// DELETE MESSAGE
// ============================================

exports.deleteMessage = async (req, res) => {

    try {

        const message = await Message.findById(

            req.params.id

        );

        if (!message) {

            return res.status(404).json({

                success: false,

                message: "Message not found"

            });

        }

        if (

            message.sender.toString()

            !==

            req.user.id

        ) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized"

            });

        }

        message.deletedForEveryone = true;

        await message.save();

        return res.status(200).json({

            success: true

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });
     }
};

exports.sendImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        const senderId = req.user.id;
        const receiverId = req.body.receiver;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Receiver is required."
            });
        }

        const imageUrl =
            `/uploads/profile/${req.file.filename}`;

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            message: "Image",
            messageType: "image",
            imageUrl
        });

        return res.status(201).json({
            success: true,
            data: message
        });

    } catch (error) {

        console.error("sendImage error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send image."
        });
    }
};



exports.sendVideo = async (req, res) => {
    try {

        // Get the sender from the authenticated user
        const senderId = req.user.id;

        // Get the receiver from the request body
        const { receiver } = req.body;

        // Check whether a video was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a video to send."
            });
        }

        // Check whether receiver was provided
        if (!receiver) {
            return res.status(400).json({
                success: false,
                message: "Receiver is required."
            });
        }

        // Create the video URL
        const videoUrl = `/uploads/videos/${req.file.filename}`;

        // Save video message in MongoDB
        const newMessage = await Message.create({

            sender: senderId,
            receiver: receiver,

            message: "Video",
            messageType: "video",

            videoUrl: videoUrl

        });

        // Return the saved message
        return res.status(201).json({
            success: true,
            message: "Video sent successfully.",
            data: newMessage
        });

    } catch (error) {

        console.error("sendVideo error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send video.",
            error: error.message
        });

    }
};
