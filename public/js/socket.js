window.socket = io("http://localhost:4600", {
    transports: ["websocket", "polling"]
});

console.log("Socket created:", window.socket);

window.socket.on("connect", () => {
    console.log("Socket connected:", window.socket.id);

    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.id) {
        window.socket.emit("register", String(user.id));

        console.log("User registered:", user.id);
    }
});