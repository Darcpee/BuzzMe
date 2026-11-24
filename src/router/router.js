const express = require("express");
const { registerUser, login, updateProfile, searchUser } = require("../AUTH/user");
const { sendMessage, getConversation } = require("../AUTH/message");
const upload = require("../middleware/uploadprofile");
const authenticateToken = require("../middleware/authmiddleware");
const uploadVideo = require("../middleware/uploadvideos");
const { createConversation, getConversationById } = require("../AUTH/conversation");
const router = express.Router();

router.post("/registerUser", upload.single("profileImage"), registerUser);
router.post("/login", login);
router.get("/searchUser/:phoneNumber", require("../middleware/authmiddleware").authenticateToken, searchUser);
router.get("/searchUserById/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/user").searchUserById);
router.put("/updateProfile", require("../middleware/authmiddleware").authenticateToken, updateProfile);
router.post("/createConversation", require("../middleware/authmiddleware").authenticateToken, createConversation);
router.post("/sendMessage", require("../middleware/authmiddleware").authenticateToken,require("../AUTH/message").sendMessage);
router.get("/getConversation/:receiverid", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/conversation").getConversation);
//router.get("/getConversationById/:id", require("../middleware/authmiddleware").authenticateToken, getConversationById);
router.get("/getConversationList", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/conversation").getConversationList);
router.get("/getMessages/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").getMessages);
//router.get("/getAllConversations", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/conversation").getAllConversations);
//router.get("/getAllMessages", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").getAllMessages);
router.delete("/deleteMessage/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").deleteMessage);
router.post("/sendImage",require("../middleware/authmiddleware").authenticateToken,require("../middleware/uploadprofile").single("image"),require("../AUTH/message").sendImage);
router.post("/sendVideo",require("../middleware/authmiddleware").authenticateToken,require("../middleware/uploadvideos").single("video"),require("../AUTH/message").sendVideo);
// router.delete("/deleteAllMessage/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").deleteAllMessage);
// router.delete("/deleteAllConversation/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").deleteAllConversation);
// router.delete("/deleteConversation/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").deleteAllConversation);
//router.put("/markAsSeen/:id", require("../middleware/authmiddleware").authenticateToken, require("../AUTH/message").markAsSeen);
router.get("/authenticateToken", require("../middleware/authmiddleware").authenticateToken, (req,res) =>{
    res.status(200).json({
        message: "Token is valid",
        user: req.User
    });
});


module.exports = router;