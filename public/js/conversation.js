// ============================================
// SOCKET CONNECTION
// ============================================
// const socket = window.socket;

// console.log("conversation.js socket:", socket);

document.addEventListener("DOMContentLoaded", async () => {

    // ============================================
    // LOCAL STORAGE
    // ============================================

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const receiverId = localStorage.getItem("receiverId");
    const conversationId = localStorage.getItem("conversationId");

    if (!token || !user) {
        window.location.href = "otp.html";
        return;
    }

    if (!receiverId || !conversationId) {
        alert("Conversation not found");
        window.location.href = "chatscreen.html";
        return;
    }

    // ============================================
    // REGISTER USER
    // ============================================

    // socket.on("connect", () => {

    // console.log("Socket connected:", socket.id);

    // socket.emit("register", String(user.id));

//});

    // ============================================
    // ELEMENTS
    // ============================================

    const receiverImage = document.getElementById("receiverImage");
    const receiverName = document.getElementById("receiverName");
    const receiverStatus = document.getElementById("receiverStatus");
    const onlineIndicator = document.getElementById("onlineIndicator");

    const chatContainer = document.getElementById("chatContainer");
    const messagesList = document.getElementById("messagesList");
    const chatBottom = document.getElementById("chatBottom");
    const attachBtn = document.getElementById("attachBtn");
    const imageInput = document.getElementById("imageInput");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const imagePreview = document.getElementById("imagePreview");
    const imageFileName = document.getElementById("imageFileName");
    const cancelImageBtn = document.getElementById("cancelImageBtn");
    const sendImageBtn = document.getElementById("sendImageBtn");
    let selectedImage = null;
    let previewUrl = null;
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const backBtn = document.getElementById("backBtn");
    const typingIndicator = document.getElementById("typingIndicator");
    const typingText = document.getElementById("typingText");

    // ============================================
    // NOTIFICATION SOUND
    // ============================================

    // const notificationSound = new Audio(
    //     "http://localhost:4600/sounds/notification.mp3"
    // );

    // ============================================
    // PREVENT DUPLICATE MESSAGES
    // ============================================

    const displayedMessages = new Set();

    // ============================================
// ALWAYS SHOW LAST MESSAGE
// ============================================
// ============================================
// SCROLL TO LAST MESSAGE
// ============================================
function scrollToBottom() {

    if (!chatContainer) {
        console.log("chatContainer missing");
        return;
    }

    chatContainer.scrollTop =
        chatContainer.scrollHeight;

    console.log(
        "SCROLLED TO:",
        chatContainer.scrollTop
    );
}

    // ============================================
    // TYPING INDICATOR
    // ============================================


    // ============================================
    // BACK BUTTON
    // ============================================

    backBtn.addEventListener("click", () => {

        window.location.href = "chatscreen.html";

    });

    // ============================================
    // ENABLE SEND BUTTON
    // ============================================

    sendBtn.disabled = true;

    // ============================================
    // UPDATE ONLINE STATUS
    // ============================================

    function updateOnlineStatus(isOnline) {

        if (isOnline) {

            receiverStatus.textContent = "Online";

            receiverStatus.className =
                "text-xs text-green-600";

            onlineIndicator.className =
                "absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white";

        }

        else {

            receiverStatus.textContent = "Offline";

            receiverStatus.className =
                "text-xs text-gray-500";

            onlineIndicator.className =
                "absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-400 border-2 border-white";

        }

    }

    // ============================================
    // LOAD RECEIVER
    // ============================================

    async function loadReceiver() {

        try {

            const response = await fetch(

                `http://localhost:4600/searchUserById/${receiverId}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            receiverName.textContent =
                data.user.userName;

            receiverImage.src = data.user.profileImage

                ? `http://localhost:4600${data.user.profileImage}`

                : "/images/default-avatar.png";

            updateOnlineStatus(data.user.isOnline);

        }

        catch (error) {

            console.log(error);

        }

    }

    // ============================================
    // ONLINE EVENTS
    // ============================================

   window.socket.on("userOnline", (userId) => {

        if (String(userId) === String(receiverId)) {

            updateOnlineStatus(true);

        }

    });

    window.socket.on("userOffline", (userId) => {

        if (String(userId) === String(receiverId)) {

            updateOnlineStatus(false);

        }

    });

// Open image picker
attachBtn.addEventListener("click", () => {
    imageInput.click();
});


// Select an image
imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        imageInput.value = "";
        return;
    }

    // Limit image size to 10 MB
    if (file.size > 10 * 1024 * 1024) {
        alert("Please choose an image smaller than 10 MB.");
        imageInput.value = "";
        return;
    }

    selectedImage = file;

    // Release an earlier preview URL
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);

    imagePreview.src = previewUrl;
    imageFileName.textContent = file.name;

    imagePreviewContainer.classList.remove("hidden");
});


// Cancel selected image
cancelImageBtn.addEventListener("click", clearImageSelection);


function clearImageSelection() {

    selectedImage = null;
    imageInput.value = "";

    imagePreview.removeAttribute("src");

    imagePreviewContainer.classList.add("hidden");

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }
}


// Upload and send image
sendImageBtn.addEventListener("click", async () => {

    if (!selectedImage) return;

    const formData = new FormData();

    // These names must match the backend
    formData.append("image", selectedImage);
    formData.append("receiver", receiverId);

    sendImageBtn.disabled = true;
    sendImageBtn.textContent = "Sending...";

    try {

        const response = await fetch(
            "http://localhost:4600/sendImage",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${token}`
                },

                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Image upload failed.");
        }

        // Display the saved image in the sender's chat
        appendMessage(data.data);

        // Notify the other user in real time
        window.socket.emit("sendMessage", data.data);

        // Scroll using your existing chat container
        requestAnimationFrame(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });

        clearImageSelection();

    } catch (error) {

        console.error("Image sending error:", error);
        alert(error.message || "Could not send image.");

    } finally {

        sendImageBtn.disabled = false;
        sendImageBtn.textContent = "Send";

    }
});




  // ============================================
// TYPING INDICATOR
// ============================================

let typingTimer = null;
let isTyping = false;

messageInput.addEventListener("input", () => {

    const text = messageInput.value.trim();

    // Enable / disable send button
    sendBtn.disabled = text === "";

    // -----------------------------------------
    // USER STARTED TYPING
    // -----------------------------------------

    if (text.length > 0) {

        if (!isTyping) {

            isTyping = true;

            console.log("I am typing...");

            socket.emit("typing", {

                sender: String(user.id),

                receiver: String(receiverId)

            });

        }

    }

    // -----------------------------------------
    // USER CLEARED INPUT
    // -----------------------------------------

    else {

        stopTyping();

        return;

    }

    // -----------------------------------------
    // RESET TIMER
    // -----------------------------------------

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {

        stopTyping();

    }, 1500);

});

function stopTyping() {

    if (!isTyping) return;

    isTyping = false;

    clearTimeout(typingTimer);

    console.log("I stopped typing.");

    window.socket.emit("stopTyping", {

        sender: String(user.id),

        receiver: String(receiverId)

    });

}

   window.socket.on("typing", (senderId) => {

    console.log(
        "TYPING EVENT RECEIVED FROM:",
        senderId
    );

    console.log(
        "EXPECTED RECEIVER:",
        receiverId
    );

    if (String(senderId) !== String(receiverId)) {

        console.log("Typing event ignored.");

        return;

    }

    typingIndicator.classList.remove("hidden");

    typingIndicator.classList.add("flex");

    typingText.textContent =
        `${receiverName.textContent} is typing...`;

});

  window.socket.on("stopTyping", (senderId) => {

    console.log(
        "STOP TYPING EVENT RECEIVED FROM:",
        senderId
    );

    if (String(senderId) !== String(receiverId)) {

        return;

    }

    typingIndicator.classList.remove("flex");

    typingIndicator.classList.add("hidden");

});
    // ============================================
    // APPEND MESSAGE
    // ============================================

   
function appendMessage(message) {

    if (!message) return;

    // Prevent duplicate messages
    if (displayedMessages.has(message._id)) return;

    displayedMessages.add(message._id);

    const senderId =
        typeof message.sender === "object"
            ? message.sender._id || message.sender.id
            : message.sender;

    const mine = String(senderId) === String(user.id);

    const wrapper = document.createElement("div");

    wrapper.id = `msg-${message._id}`;

    wrapper.className = mine
        ? "flex justify-end mb-3"
        : "flex justify-start mb-3";

    let tick = "";

    if (mine) {
        if (message.status === "seen") {
            tick = '<span class="text-blue-400">✓✓</span>';
        } else if (message.status === "delivered") {
            tick = '<span class="text-gray-400">✓✓</span>';
        } else {
            tick = '<span class="text-gray-400">✓</span>';
        }
    }

    // Create the message bubble
    const bubble = document.createElement("div");

    bubble.className = mine
        ? "bg-blue-600 text-white rounded-2xl shadow px-4 py-3 max-w-xs lg:max-w-md"
        : "bg-gray-200 text-gray-900 rounded-2xl shadow px-4 py-3 max-w-xs lg:max-w-md";

    // Display an actual picture for image messages
   // ============================================
// DISPLAY IMAGE MESSAGES
// ============================================

if (message.messageType === "image" && message.imageUrl) {

    const img = document.createElement("img");
   
    // controls both relative path and complete image url
     const imageUrl = message.imageUrl.startsWith("http")
        ? message.imageUrl
        : `http://localhost:4600${message.imageUrl.replace("/uploads/images/", "/uploads/profile/")}`;

    img.src = imageUrl;
    img.alt = "Shared image";

    img.className =
        "block max-w-full max-h-72 rounded-xl object-contain cursor-pointer";

    img.style.maxWidth = "240px";
     
    // Show an error if the image cannot load
    img.onerror = function () {
        this.alt = "Image could not be loaded";
        console.error("Could not load image:", this.src);
    };
 
     // Optional: click the image to view it larger
    img.addEventListener("click", function () {
        window.open(this.src, "_blank");
    });

    bubble.appendChild(img);


// ============================================
// DISPLAY VIDEO MESSAGES
// ============================================

} else if (message.messageType === "video" && message.videoUrl) {

    const video = document.createElement("video");

    const videoUrl = message.videoUrl.startsWith("http")
        ? message.videoUrl
        : `http://localhost:4600${message.videoUrl}`;

    video.src = videoUrl;

    video.controls = true;
    video.preload = "metadata";

    video.className =
        "block w-full max-h-72 rounded-xl object-contain";

    video.style.maxWidth = "280px";

    video.onerror = function () {
        console.error("Could not load video:", this.src);
    };

    bubble.appendChild(video);


// ============================================
// DISPLAY NORMAL TEXT MESSAGES
// ============================================

} else {
      
     // Normal text message
    const textElement = document.createElement("p");

    textElement.className = "break-words whitespace-pre-wrap";

    textElement.textContent = message.message || "";

    bubble.appendChild(textElement);
}

    // Message timestamp and delivery ticks
    const footer = document.createElement("div");

    footer.className = "flex justify-between items-center mt-2";

    const time = document.createElement("span");

    time.className = mine
        ? "text-xs text-blue-100"
        : "text-xs text-gray-500";

    time.textContent = new Date(message.createdAt).toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    footer.appendChild(time);

    if (mine) {
        const status = document.createElement("span");

        status.id = `status-${message._id}`;
        status.className = "text-xs ml-2";
        status.innerHTML = tick;

        footer.appendChild(status);
    }

    bubble.appendChild(footer);
    wrapper.appendChild(bubble);
    chatContainer.appendChild(wrapper);
}


    // ============================================
    // LOAD MESSAGES
    // ============================================

    async function loadMessages() {

        try {

            const response = await fetch(

                `http://localhost:4600/getConversation/${receiverId}`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();

            console.log("Conversation:", data);

            if (!response.ok) {

                console.log(data.message);

                return;

            }

            chatContainer.innerHTML = "";

            displayedMessages.clear();

            data.messages.forEach(message => {

                appendMessage(message);

                const senderId =
                    typeof message.sender === "object"
                        ? message.sender._id
                        : message.sender;

                // Mark ONLY receiver's messages as seen

                if (

                    String(senderId) ===
                    String(receiverId)

                    &&

                    message.status !== "seen"

                ) {

                    window.socket.emit(

                        "messageSeen",

                        {

                            messageId:
                                message._id,

                            sender:
                                receiverId

                        }

                    );

                }

            });

 setTimeout(() => {
    scrollToBottom();
}, 100);;

console.log("========== SCROLL DEBUG ==========");

console.log("chatContainer:", chatContainer);
console.log("messagesList:", messagesList);
console.log("chatBottom:", chatBottom);

console.log("clientHeight:", chatContainer?.clientHeight);
console.log("scrollHeight:", chatContainer?.scrollHeight);
console.log("scrollTop BEFORE:", chatContainer?.scrollTop);

setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;

    console.log("scrollTop AFTER:", chatContainer.scrollTop);
    console.log("scrollHeight:", chatContainer.scrollHeight);
}, 500);

        }

        catch (err) {

            console.log(err);

        }

    }

        // ============================================
    // SEND MESSAGE
    // ============================================

    async function sendMessage() {

        const text = messageInput.value.trim();

        if (!text) return;

        try {

            const response = await fetch(

                "http://localhost:4600/message/sendMessage",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        receiver: receiverId,

                        text

                    })

                }

            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            // Show my own message immediately
            appendMessage(data.data);

            // scrollToLatestMessage();

            // Send through socket for real-time delivery
            window.socket.emit("sendMessage", data.data);
            console.log("Before clearing:", messageInput.value);

            messageInput.value = "";
            console.log("After clearing:", messageInput.value);
            sendBtn.disabled = true;

            window.socket.emit("stopTyping", {

                sender: user.id,

                receiver: receiverId

            });

        }

        catch (err) {

            console.log(err);

        }

    }

    // ============================================
    // SEND BUTTON
    // ============================================

    sendBtn.addEventListener("click", sendMessage);

    // ============================================
    // ENTER KEY
    // ============================================

    messageInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendMessage();

        }

    });

    // ============================================
    // RECEIVE NEW MESSAGE
    // ============================================

  window.socket.on("receiveMessage", (message) => {

    console.log("New message received:", message);

    const senderId =
        typeof message.sender === "object"
            ? message.sender._id
            : message.sender;

    console.log("Message sender:", senderId);
    console.log("My user ID:", user.id);

    // Ignore my own echoed message
    if (String(senderId) === String(user.id)) {
        return;
    }

    // Add the message to the chat
    appendMessage(message);

    // IMPORTANT:
    // Scroll User B to the newest message
   setTimeout(() => {

        // scrollToLatestMessage();

    }, 0);

    // notificationSound.play().catch(() => {});
});


    // ============================================
    // MESSAGE DELIVERED
    // ============================================

    window.socket.on("messageDelivered", ({ messageId }) => {

        const status = document.getElementById(

            `status-${messageId}`

        );

        if (!status) return;

        status.innerHTML =

            '<span class="text-gray-400">✓✓</span>';

    });

    // ============================================
    // MESSAGE SEEN
    // ============================================

    window.socket.on("messageSeen", ({ messageId }) => {

        const status = document.getElementById(

            `status-${messageId}`

        );

        if (!status) return;

        status.innerHTML =

            '<span class="text-blue-400">✓✓</span>';

    });

    // ============================================
    // REFRESH CHAT LIST
    // ============================================

    window.socket.on("refreshConversationList", () => {

        console.log("Conversation list refreshed.");

        if (typeof loadConversationList === "function") {

            loadConversationList();

        }

    });

    // ============================================
    // INITIAL LOAD
    // ============================================

    await loadReceiver();

    await loadMessages();

});
