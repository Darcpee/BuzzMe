
//  const socket = io("http://localhost:4600");
// ============================================
// SOCKET.IO CONNECTION
// ============================================

window.socket = io("http://localhost:4600");

window.socket.on("connect", () => {
    console.log("Socket connected:", window.socket.id);
});

window.socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});


document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // USER & TOKEN
    // ==========================================

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {

        window.location.href = "otp.html";
        return;

    }
    window.socket.emit("register", user.id);

    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const profileImage = document.getElementById("myProfileImage");

    const chatList = document.getElementById("chatList");

    const newChatBtn = document.getElementById("newChatBtn");

    const searchModal = document.getElementById("searchModal");

    const searchPhone = document.getElementById("searchPhone");

    const searchBtn = document.getElementById("searchBtn");

    const searchResult = document.getElementById("searchResult");

    // ==========================================
    // LOAD MY PROFILE IMAGE
    // ==========================================

    if (profileImage) {

        if (user.profileImage) {

            profileImage.src =
                "http://localhost:4600" + user.profileImage;

        }

        else {

            profileImage.src =
                "./images/default-avatar.png";

        }

    }

    // ==========================================
    // OPEN SEARCH MODAL
    // ==========================================

    if (newChatBtn) {

        newChatBtn.addEventListener("click", () => {

            searchModal.classList.remove("hidden");

            searchModal.classList.add("flex");

            searchPhone.value = "";

            searchResult.innerHTML = "";

        });

    }

    // ==========================================
    // CLOSE SEARCH MODAL
    // ==========================================

    if (searchModal) {

        searchModal.addEventListener("click", (e) => {

            if (e.target === searchModal) {

                searchModal.classList.add("hidden");

                searchModal.classList.remove("flex");

            }

        });

    }

    // ==========================================
    // LOAD CONVERSATION LIST
    // ==========================================

    async function loadConversationList() {
        console.log("Loading conversation list...");

        try {

            const response = await fetch(

                "http://localhost:4600/getConversationList",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();
            console.log(data);

            console.log(data.conversations);
            console.log(chatList);

            if (!response.ok || !data.success) {

                console.log(data.message);

                return;

            }

            if (!chatList) return;

            chatList.innerHTML = "";

            if (data.conversations.length === 0) {

                chatList.innerHTML = `

                    <div class="text-center py-10 text-gray-500">

                        No conversations yet.

                    </div>

                `;

                return;

            }

            data.conversations.forEach(conversation => {

                const otherUser = conversation.user;

                const image = otherUser.profileImage
                    ? `http://localhost:4600${otherUser.profileImage}`
                    : "./images/default-avatar.png";

                const lastMessage =

                    conversation.lastMessageText ||

                    "Start chatting...";

                const time =

                    conversation.lastMessageTime

                    ?

                    new Date(

                        conversation.lastMessageTime

                    ).toLocaleTimeString([], {

                        hour: "2-digit",

                        minute: "2-digit"

                    })

                    :

                    "";

                const conversationDiv =

                    document.createElement("div");

                conversationDiv.className =

                    "flex items-center px-4 py-4 hover:bg-gray-50 cursor-pointer";

                conversationDiv.innerHTML = `

                    <div class="relative">

                        <img

                            src="${image}"

                            class="w-14 h-14 rounded-full object-cover">

                        <span

                            class="absolute bottom-0 right-0

                            w-3 h-3 rounded-full

                            ${otherUser.isOnline

                                ? "bg-green-500"

                                : "bg-gray-400"}

                            border-2 border-white">

                        </span>

                    </div>

                    <div

                        class="flex-1 ml-4 border-b border-gray-100 pb-3">

                        <div

                            class="flex justify-between">

                            <h3

                                class="font-semibold">

                                ${otherUser.userName}

                            </h3>

                            <span

                                class="text-xs text-gray-400">

                                ${time}

                            </span>

                        </div>

                        <p

                            class="text-sm text-gray-500 truncate mt-1">

                            ${lastMessage}

                        </p>

                    </div>

                `;

                conversationDiv.addEventListener("click", () => {

                    localStorage.setItem(

                        "conversationId",

                        conversation.conversationId

                    );

                    localStorage.setItem(

                        "receiverId",

                        otherUser._id

                    );

                    window.location.href =

                        "conversation.html";

                });

                chatList.appendChild(

                    conversationDiv

                );

            });

        }

        catch (error) {

            console.log(error);

        }

    }

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadConversationList();
    // ==========================================
    // SEARCH USER
    // ==========================================

    if (searchBtn) {

        searchBtn.addEventListener("click", searchUser);

    }

    async function searchUser() {

        const phoneNumber = searchPhone.value.trim();

        if (!phoneNumber) {

            alert("Enter a phone number");

            return;

        }

        searchResult.innerHTML = `

            <p class="text-center text-gray-500">

                Searching...

            </p>

        `;

        try {

            const response = await fetch(

                `http://localhost:4600/searchUser/${encodeURIComponent(phoneNumber)}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                searchResult.innerHTML = `

                    <p class="text-red-500 text-center">

                        User not found.

                    </p>

                `;

                return;

            }

            const foundUser = data.user;

            const image =

                foundUser.profileImage

                ?

                `http://localhost:4600${foundUser.profileImage}`

                :

                "./images/default-avatar.png";

            searchResult.innerHTML = `

                <div class="flex items-center justify-between">

                    <div class="flex items-center gap-3">

                        <img

                            src="${image}"

                            class="w-14 h-14 rounded-full object-cover">

                        <div>

                            <h3 class="font-semibold">

                                ${foundUser.userName}

                            </h3>

                            <p class="text-sm text-gray-500">

                                ${foundUser.phoneNumber}

                            </p>

                        </div>

                    </div>

                    <button

                        id="startChatBtn"

                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

                        Chat

                    </button>

                </div>

            `;

            document

                .getElementById("startChatBtn")

                .addEventListener("click", () => {

                    startConversation(foundUser.id);

                });

        }

        catch (error) {

            console.log(error);

            searchResult.innerHTML = `

                <p class="text-red-500 text-center">

                    Server Error

                </p>

            `;

        }

    }

    // ==========================================
    // CREATE CONVERSATION
    // ==========================================

    async function startConversation(receiverId) {

        try {

            const response = await fetch(

                "http://localhost:4600/createConversation",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        receiverId

                    })

                }

            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                alert(data.message);

                return;

            }

            localStorage.setItem(

                "conversationId",

                data.conversation._id

            );

            localStorage.setItem(

                "receiverId",

                receiverId

            );

            // Refresh conversation list
            await loadConversationList();

            // Close modal
            searchModal.classList.add("hidden");

            searchModal.classList.remove("flex");

            // Open conversation
            window.location.href =

                "conversation.html";

        }

        catch (error) {

            console.log(error);

            alert("Unable to start conversation.");

        }

    }
        // ==========================================
    // REFRESH CHAT LIST WHEN RETURNING
    // ==========================================

    window.addEventListener("focus", () => {

        loadConversationList();

    });

    // ==========================================
    // OPTIONAL:
    // PRESS ENTER TO SEARCH
    // ==========================================

    if (searchPhone) {

        searchPhone.addEventListener("keypress", (e) => {

            if (e.key === "Enter") {

                e.preventDefault();

                searchUser();

            }

        });

    }

    // ==========================================
    // AUTO REFRESH EVERY 5 SECONDS
    // ==========================================

    setInterval(() => {

        loadConversationList();

    }, 5000);

});






























// document.addEventListener("DOMContentLoaded", () => {

//     // ==========================
//     // CHECK LOGIN
//     // ==========================

//     const user = JSON.parse(localStorage.getItem("user"));
//     const token = localStorage.getItem("token");


//    console.log(user);
//    console.log(user.profileImage);

//     if (!user || !token) {

//         window.location.href = "otp.html";
//         return;

//     }

//     // ==========================
//     // LOAD MY PROFILE IMAGE
//     // ==========================

//     const profileImage = document.getElementById("myProfileImage");

//     if (profileImage && user.profileImage) {

//         profileImage.src =
//             "http://localhost:4600" + user.profileImage;

//     }

//     // ==========================
//     // SEARCH MODAL
//     // ==========================

//     const newChatBtn = document.getElementById("newChatBtn");
//     const searchModal = document.getElementById("searchModal");
//     const searchBtn = document.getElementById("searchBtn");
//     const searchPhone = document.getElementById("searchPhone");
//     const searchResult = document.getElementById("searchResult");

//     if (newChatBtn) {

//         newChatBtn.addEventListener("click", () => {

//             searchModal.classList.remove("hidden");
//             searchModal.classList.add("flex");

//             searchPhone.value = "";
//             searchResult.innerHTML = "";

//         });

//     }

//     // Close modal when clicking outside

//     if (searchModal) {

//         searchModal.addEventListener("click", (e) => {

//             if (e.target === searchModal) {

//                 searchModal.classList.add("hidden");
//                 searchModal.classList.remove("flex");

//             }

//         });

//     }

//     // ==========================
//     // SEARCH USER
//     // ==========================

//     if (searchBtn) {

//         searchBtn.addEventListener("click", searchUser);

//     }

//     async function searchUser() {
//                         console.log("Token:", token);
             
//         const phoneNumber = searchPhone.value.trim();

//         if (!phoneNumber) {

//             alert("Enter a phone number");
//             return;

//         }

//         searchResult.innerHTML =
//             "<p class='text-center text-gray-500'>Searching...</p>";

//         try {

//             const response = await fetch(

//                 `http://localhost:4600/searchUser/${encodeURIComponent(phoneNumber)}`,

//                 {

//                     headers: {
                 
//                         Authorization: `Bearer ${token}`

//                     }

//                 }

//             );

//             const data = await response.json();

//             if (!response.ok || !data.success) {

//                 searchResult.innerHTML =
//                     "<p class='text-red-500 text-center'>User not found.</p>";

//                 return;

//             }

//             const foundUser = data.user;

//             searchResult.innerHTML = `

//                 <div class="flex items-center justify-between">

//                     <div class="flex items-center gap-3">

//                         <img
//                             src="http://localhost:4600${foundUser.profileImage}"
//                             class="w-14 h-14 rounded-full object-cover">

//                         <div>

//                             <h3 class="font-semibold">

//                                 ${foundUser.userName}

//                             </h3>

//                             <p class="text-sm text-gray-500">

//                                 ${foundUser.phoneNumber}

//                             </p>

//                         </div>

//                     </div>

//                     <button
//                         id="startChatBtn"
//                         class="bg-blue-600 text-white px-4 py-2 rounded-lg">

//                         Chat

//                     </button>

//                 </div>

//             `;
//             console.log("foundUser:", foundUser);
//             console.log("Object keys:", Object.keys(foundUser));
//             console.log("foundUser._id:", foundUser._id);
//             console.log("foundUser.id:", foundUser.id); 

//             document
//                 .getElementById("startChatBtn")
//                 .addEventListener("click", () => {
//                     console.log("Button clicked");
//                     console.log("Sending receiverId:", foundUser.id);

//                     startConversation(foundUser.id);

//                 });

//         }

//         catch (error) {

//             console.error(error);

//             searchResult.innerHTML =
//                 "<p class='text-red-500 text-center'>Server Error</p>";

//         }

//     }

//     // ==========================
//     // CREATE CONVERSATION
//     // ==========================

//     async function startConversation(receiverId) {
//         console.log("receiverId:", receiverId);
//         try {

//             const response = await fetch(

//                 "http://localhost:4600/createConversation",

//                 {

//                     method: "POST",

//                     headers: {

//                         "Content-Type": "application/json",
                        

//                         Authorization: `Bearer ${token}`

//                     },

//                     body: JSON.stringify({

//                         receiverId

//                     })
//                     });
//             const data = await response.json();
//               console.log(data)
//             if (!response.ok || !data.success) {

//                 alert(data.message);

//                 return;

//             }

//             localStorage.setItem(

//                 "conversationId",

//                 data.conversation._id

//             );

//             localStorage.setItem(

//                 "receiverId",

//                 receiverId

//             );

//             window.location.href = "conversation.html";

//         }

//         catch (error) {

//             console.error(error);

//             alert("Unable to start conversation.");

//         }

//     }

// });

// THIS IS FOR UPDATING PROFILE IMAGE 

// const user = JSON.parse(localStorage.getItem("user"));

// const myProfileImage = document.getElementById("myProfileImage");

// if (user && user.profileImage) {
//     myProfileImage.src =
//         "http://localhost:4600" + user.profileImage;
// }









































// Button Click Animation

        // document.querySelectorAll("button,a").forEach(item => {

        //     item.addEventListener("touchstart", () => {

        //         item.classList.add("opacity-70");

        //     });

        //     item.addEventListener("touchend", () => {

        //         item.classList.remove("opacity-70");

        //     });

        // });





        // // Floating Button Animation

        // const fab = document.querySelector("button.fixed");

        // let lastScroll = 0;

        // window.addEventListener("scroll", () => {

        //     let current = window.pageYOffset;

        //     if (current > lastScroll && current > 100) {

        //         fab.style.transform = "scale(0)";
        //         fab.style.opacity = "0";

        //     } else {

        //         fab.style.transform = "scale(1)";
        //         fab.style.opacity = "1";

        //     }

        //     lastScroll = current;

        // });

        // fab.style.transition = ".25s";
