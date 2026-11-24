const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const { socketHandler } = require("./src/sockets/socket");
const server = http.createServer(app);
const DB =process.env.DB
const PORT = process.env.PORT || 4600;



//import routes
const userRouter = require("./src/router/router");
const conversationRouter = require("./src/router/router");
const messageRouter = require("./src/router/router");

console.log("conversationRoute:", conversationRouter);
console.log("messageRoute:", messageRouter);
console.log("userRoute:", userRouter);

app.use(express.json());
app.use(cors());

// Register routes
app.use("/user", userRouter);
app.use("/conversation", conversationRouter);
app.use("/message", messageRouter);
console.log(userRouter);
console.log(conversationRouter);
console.log(messageRouter);


app.use("/", require("./src/router/router"));
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    "/sounds",
    express.static(path.join(__dirname, "sounds"))
);





const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.set("io", io);
socketHandler(io);


// SOCKET.IO
// =======================

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    // Receive Message
    socket.on("sendMessage", (message) => {

        console.log("New Message:", message);

        // Send message to everyone
        io.emit("receiveMessage", message);

    });

    // User Disconnect
    socket.on("disconnect", () => {

        console.log("User Disconnected:", socket.id);

    });

});





server.listen(PORT, async () => {
    console.log(`server is running on localhost:${PORT}`)
    try {
        await mongoose.connect(DB);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
});