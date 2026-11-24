const User = require("../model/user");
const Message = require("../model/message");

const users = {};

function socketHandler(io) {

    io.on("connection", (socket) => {

        console.log("Socket Connected:", socket.id);

        // ==========================================
// REJECT CALL
// ==========================================

socket.on(
    "rejectCall",
    ({ callerId, receiverId }) => {

        console.log(
            "Call rejected"
        );

        console.log(
            "Caller:",
            callerId
        );

        console.log(
            "Receiver:",
            receiverId
        );

        const callerSocket =
            users[String(callerId)];

        if (!callerSocket) {

            console.log(
                "Caller is no longer connected"
            );

            return;
        }

        io.to(callerSocket).emit(
            "callRejected"
        );

    }
);

        // ==========================================
        // REGISTER USER
        // ==========================================

         socket.on("register", async (userId) => {

            try {

                userId = String(userId);

                socket.userId = userId;

                users[userId] = socket.id;

                console.log(
                    "User registered:",
                    userId
                );
                 console.log(
                     "SOCKET ID:",
                    socket.id
                );

                console.log(
                    "Current users:",
                    users
                );

                await User.findByIdAndUpdate(
                    userId,
                    {
                        isOnline: true
                    }
                );

                io.emit(
                    "userOnline",
                    userId
                );

            }

            catch (error) {

                console.log(
                    "Register error:",
                    error
                );

            }

        });

        // ==========================================
        // SEND MESSAGE
        // ==========================================

        socket.on("sendMessage", async (message) => {
             console.log("Socket sendMessage fired:", message);
            try {

                const receiverSocket = users[message.receiver];

                // Receiver is online
                if (receiverSocket) {

                    await Message.findByIdAndUpdate(

                        message._id,

                        {

                            status: "delivered"

                        }

                    );

                    io.to(receiverSocket).emit(

                        "receiveMessage",

                        {

                            ...message,

                            status: "delivered"

                        }

                    );

                    // Notify sender that message has been delivered
                    io.to(socket.id).emit(

                        "messageDelivered",

                        {

                            messageId: message._id

                        }

                    );

                }

                // Receiver is offline
                else {

                    io.to(socket.id).emit(

                        "messageSent",

                        {

                            messageId: message._id

                        }

                    );

                }

                io.emit("refreshConversationList");

            }

            catch (error) {

                console.log(error);

            }

        });
                // ==========================================
        // TYPING
        // ==========================================

          socket.on("typing", ({ sender, receiver }) => {
                sender = String(sender);
                receiver = String(receiver);
          console.log("TYPING:", sender, "=>", receiver );
                    const receiverSocket =
                    users[receiver];
                    console.log(  "Receiver socket:",receiverSocket );
               if (!receiverSocket) {
                 console.log(  "Receiver is not connected:",  receiver  );
                   return;

                }

                io.to(receiverSocket).emit(
                    "typing",
                    sender
                );
              });



        // ==========================================
        // STOP TYPING
        // ==========================================

        
 socket.on("stopTyping",  ({ sender, receiver }) => {
                sender = String(sender);
                receiver = String(receiver);
         console.log( "STOP TYPING:", sender, "=>",
                    receiver
                );

                const receiverSocket =
                    users[receiver];

                if (!receiverSocket) {

                    return;

                }

                io.to(receiverSocket).emit(
                    "stopTyping",
                    sender
                );
            });

        // ==========================================
        // MESSAGE SEEN
        // ==========================================

        socket.on("messageSeen", async ({ messageId, sender }) => {

            try {

                // Update database only if not already seen
                const message = await Message.findById(messageId);

                if (!message) return;

                if (message.status !== "seen") {

                    message.status = "seen";

                    await message.save();

                }

                const senderSocket = users[sender];

                if (senderSocket) {

                    io.to(senderSocket).emit(

                        "messageSeen",

                        {

                            messageId

                        }

                    );

                }

            }

            catch (error) {

                console.log(error);

            }

        });

// ==========================================
// CALL USER
// ==========================================

socket.on(
    "callUser",
    async ({ callerId, receiverId, callType, offer }) => {

        try {

            callerId = String(callerId);
            receiverId = String(receiverId);
            callType = String(callType);
            offer = offer || null;

            console.log("================================");
            console.log("CALL REQUEST");
            console.log("Caller:", callerId);
            console.log("Receiver:", receiverId);
            console.log("Type:", callType);
            console.log("Offer received:", !!offer);
            console.log("================================");

            // Find receiver's socket
            const receiverSocket =
                users[receiverId];

            console.log(
                "Receiver socket:",
                receiverSocket
            );

            // Receiver is offline
            if (!receiverSocket) {

                console.log(
                    "Receiver is offline:",
                    receiverId
                );

                return;

            }

            // Get caller information
            const caller = await User.findById(
                callerId
            ).select(
                "userName profileImage"
            );

            // Send incoming call to receiver
            io.to(receiverSocket).emit(
                "incomingCall",
                {
                    callerId,
                    callerName:
                        caller?.userName ||
                        "Unknown User",

                    callerImage:
                        caller?.profileImage ||
                        null,

                    callType:
                        callType || "voice",
                    offer:
                        offer || null
                }
            );

        }

        catch (error) {

            console.log(
                "Call error:",
                error
            );

        }

    }
);


// ==========================================
// ACCEPT CALL
// ==========================================

socket.on(
    "acceptCall",
    ({ callerId, receiverId, answer }) => {

        console.log("================================");
        console.log("CALL ACCEPTED");
        console.log("Caller:", callerId);
        console.log("Receiver:", receiverId);
        console.log("Answer received:", !!answer);
        console.log("================================");

        const callerSocket =
            users[String(callerId)];

        console.log(
            "Caller socket:",
            callerSocket
        );

        // Caller is no longer connected
        if (!callerSocket) {

            console.log(
                "Caller is no longer connected"
            );

            return;
        }

        // Send answer back to caller
        io.to(callerSocket).emit(
            "callAccepted",
            {
                receiverId: String(receiverId),
                answer: answer
            }
        );

        console.log(
            "Call answer forwarded to caller."
        );

    }
);



// ==========================================
// END CALL
// ==========================================

socket.on(
    "endCall",
    ({ callerId, receiverId }) => {

        console.log("================================");
        console.log("END CALL RECEIVED");
        console.log("Caller:", callerId);
        console.log("Receiver:", receiverId);
        console.log("================================");

        const otherUserSocket =
            users[String(receiverId)];

        console.log(
            "Other user socket:",
            otherUserSocket
        );

        if (!otherUserSocket) {

            console.log(
                "Other user is offline or socket not found."
            );

            return;
        }

        io.to(otherUserSocket).emit(
            "callEnded"
        );

        console.log(
            "callEnded sent successfully."
        );

    }
);




// ================================
// ICE CANDIDATE
// ==============================

socket.on("iceCandidate", ({ candidate, receiverId }) => {

    console.log("================================");
    console.log("ICE CANDIDATE RECEIVED");
    console.log("Receiver:", receiverId);

    const receiverSocket =
        users[String(receiverId)];

    console.log(
        "Receiver socket:",
        receiverSocket
    );

    if (!receiverSocket) {
        console.log("Receiver is offline");
        return;
    }

    io.to(receiverSocket).emit("iceCandidate", {
        candidate
    });

    console.log("ICE candidate forwarded.");
});


                // ==========================================
        // DISCONNECT
        // ==========================================

         socket.on("disconnect", async () => {

            try {

                if (!socket.userId) {
                    return;
                }

                const userId =
                    String(socket.userId);

                // Only delete if this socket is
                // still the user's active socket

                if (
                    users[userId] === socket.id
                ) {

                    delete users[userId];

                }

                await User.findByIdAndUpdate(
                    userId,
                    {
                        isOnline: false,
                        lastSeen: new Date()
                    }
                );

                io.emit(
                    "userOffline",
                    userId
                );

                console.log(
                    "User disconnected:",
                    userId
                );

                console.log(
                    "Current users:",
                    users
                );

            }

            catch (error) {

                console.log(
                    "Disconnect error:",
                    error
                );

            }

        });

    });

}



module.exports = { socketHandler, users};