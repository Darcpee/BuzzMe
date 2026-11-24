const Conversation = require("../model/conversation");
const Message = require("../model/message");

// ============================================
// CREATE CONVERSATION
// ============================================

exports.createConversation = async (req, res) => {

    try {

        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {

            return res.status(400).json({
                success: false,
                message: "Receiver is required."
            });

        }

        if (senderId === receiverId) {

            return res.status(400).json({
                success: false,
                message: "You cannot chat with yourself."
            });

        }

        let conversation = await Conversation.findOne({

            participants: {
                $all: [senderId, receiverId]
            }

        });

        if (conversation) {

            return res.status(200).json({

                success: true,
                conversation

            });

        }

        conversation = await Conversation.create({

            participants: [senderId, receiverId]

        });

        return res.status(201).json({

            success: true,
            conversation

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
// GET CONVERSATION
// ============================================

exports.getConversation = async (req, res) => {

    try {

        const sender = req.user.id;

        const receiver = req.params.receiverid;

        const messages = await Message.find({

            $or: [

                {
                    sender,
                    receiver
                },

                {
                    sender: receiver,
                    receiver: sender
                }

            ]

        }).sort({

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
// GET CONVERSATION LIST
// ============================================

exports.getConversationList = async (req, res) => {

    try {

        const userId = req.user.id;

        const conversations = await Conversation.find({

            participants: userId

        })

            .populate(

                "participants",

                "userName profileImage isOnline lastSeen phoneNumber"

            )

            .populate("lastMessage")

            .sort({

                lastMessageTime: -1

            });

        const list = conversations.map((conversation) => {

            const otherUser = conversation.participants.find(

                (p) => p._id.toString() !== userId

            );

            return {

                conversationId: conversation._id,

                user: otherUser,

                lastMessage: conversation.lastMessage,

                lastMessageText: conversation.lastMessageText,

                lastMessageTime: conversation.lastMessageTime

            };

        });

        return res.status(200).json({

            success: true,
            conversations: list

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};