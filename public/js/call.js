// ============================================================
// PINGOAPP - CALL.JS
// Voice Call + Video Call + WebRTC + Socket.IO
// ============================================================


// ============================================================
// 1. WAIT FOR HTML
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log(" call.js loaded");


    // ========================================================
    // 2. CHECK SOCKET
    // ========================================================

    console.log(
        "window.socket =",
        window.socket
    );


    if (!window.socket) {

        console.error(
            "Socket is not available."
        );

        console.error(
            "Make sure socket.js loads before call.js."
        );

        return;
    }


    // ========================================================
    // 3. USER DATA
    // ========================================================

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const receiverId =
        localStorage.getItem("receiverId");


    if (!user) {

        console.error(
            "Logged-in user not found."
        );

        return;
    }


    console.log(
        "My user ID:",
        user.id
    );


    console.log(
        "Receiver ID:",
        receiverId
    );


    // ========================================================
    // 4. WEBRTC VARIABLES
    // ========================================================

    let peerConnection = null;

    let localStream = null;

    let remoteStream = null;
    let callTimerInterval = null;
    let callStartTime = false;


    // This is VERY important.
    //
    // For User A:
    // currentCallUserId = User B
    //
    // For User B:
    // currentCallUserId = User A

    let currentCallUserId =
        receiverId || null;


    let currentCallType =
        "voice";


    let pendingOffer =
        null;
    let pendingIceCandidates = [];
   


    // ========================================================
    // 5. STUN SERVER
    // ========================================================

    const rtcConfiguration = {

        iceServers: [

            {
                urls:
                    "stun:stun.l.google.com:19302"
            }

        ]

    };


    // ========================================================
    // 6. HTML ELEMENTS
    // ========================================================


    // --------------------------------------------------------
    // CALL BUTTONS
    // --------------------------------------------------------

    const voiceCallBtn =
        document.getElementById(
            "voiceCallBtn"
        );


    const videoCallBtn =
        document.getElementById(
            "videoCallBtn"
        );


    // --------------------------------------------------------
    // INCOMING CALL
    // --------------------------------------------------------

    const incomingCallModal =
        document.getElementById(
            "incomingCallModal"
        );


    const incomingCallImage =
        document.getElementById(
            "incomingCallImage"
        );


    const incomingCallName =
        document.getElementById(
            "incomingCallName"
        );


    const incomingCallType =
        document.getElementById(
            "incomingCallType"
        );


    const acceptCallBtn =
        document.getElementById(
            "acceptCallBtn"
        );


    const acceptCallIcon =
        document.getElementById(
            "acceptCallIcon"
        );


    const rejectCallBtn =
        document.getElementById(
            "rejectCallBtn"
        );


    // --------------------------------------------------------
    // ACTIVE CALL
    // --------------------------------------------------------

    const activeCallModal =
        document.getElementById(
            "activeCallModal"
        );


    const activeCallImage =
        document.getElementById(
            "activeCallImage"
        );


    const activeCallName =
        document.getElementById(
            "activeCallName"
        );


    const callStatus =
        document.getElementById(
            "callStatus"
        );


    // --------------------------------------------------------
    // VOICE CALL
    // --------------------------------------------------------

    const voiceCallContainer =
        document.getElementById(
            "voiceCallContainer"
        );


    const voiceCallImage =
        document.getElementById(
            "voiceCallImage"
        );


    const voiceCallName =
        document.getElementById(
            "voiceCallName"
        );


    const voiceCallStatus =
        document.getElementById(
            "voiceCallStatus"
        );
    const voiceCallTimer =
    document.getElementById(
        "voiceCallTimer"
    );


    // --------------------------------------------------------
    // VIDEO CALL
    // --------------------------------------------------------

    const videoCallContainer =
        document.getElementById(
            "videoCallContainer"
        );


    const remoteVideo =
        document.getElementById(
            "remoteVideo"
        );


    const localVideo =
        document.getElementById(
            "localVideo"
        );


    // --------------------------------------------------------
    // AUDIO
    // --------------------------------------------------------

    const remoteAudio =
        document.getElementById(
            "remoteAudio"
        );


    // --------------------------------------------------------
    // CALL CONTROLS
    // --------------------------------------------------------

    const muteBtn =
        document.getElementById(
            "muteBtn"
        );


    const muteIcon =
        document.getElementById(
            "muteIcon"
        );


    const cameraBtn =
        document.getElementById(
            "cameraBtn"
        );


    const cameraIcon =
        document.getElementById(
            "cameraIcon"
        );


    const endCallBtn =
        document.getElementById(
            "endCallBtn"
        );


    // ========================================================
    // 7. CHECK ELEMENTS
    // ========================================================

    console.log(
        "Voice button:",
        voiceCallBtn
    );


    console.log(
        "Video button:",
        videoCallBtn
    );


    console.log(
        "Incoming modal:",
        incomingCallModal
    );


    console.log(
        "Reject button:",
        rejectCallBtn
    );


    console.log(
        "Accept button:",
        acceptCallBtn
    );


    console.log(
        "Active modal:",
        activeCallModal
    );


    // ========================================================
    // 8. HELPER - SHOW ELEMENT
    // ========================================================

    function showElement(element) {

        if (!element) return;

        element.classList.remove(
            "hidden"
        );

        element.classList.add(
            "flex"
        );

    }


    // ========================================================
    // 9. HELPER - HIDE ELEMENT
    // ========================================================

    function hideElement(element) {

        if (!element) return;

        element.classList.add(
            "hidden"
        );

        element.classList.remove(
            "flex"
        );

    }


    // ========================================================
    // 10. UPDATE CALL STATUS
    // ========================================================

    function updateCallStatus(status) {

        if (callStatus) {

            callStatus.textContent =
                status;

        }


        if (voiceCallStatus) {

            voiceCallStatus.textContent =
                status;

        }

    }


    // ========================================================
    // 11. UPDATE CALL USER INFORMATION
    // ========================================================

    function updateCallUser(
        name,
        image
    ) {

        const displayName =
            name || "Unknown User";


        // Active video call

        if (activeCallName) {

            activeCallName.textContent =
                displayName;

        }


        // Voice call

        if (voiceCallName) {

            voiceCallName.textContent =
                displayName;

        }


        // Active call image

        if (
            image &&
            activeCallImage
        ) {

            activeCallImage.src =
                image;

        }


        // Voice image

        if (
            image &&
            voiceCallImage
        ) {

            voiceCallImage.src =
                image;

        }

    }


    // ========================================================
    // 12. GET IMAGE URL
    // ========================================================

    function getImageUrl(image) {

        if (!image) {

            return "./images/default-avatar.png";

        }


        // Already a full URL

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;

        }


        // Backend image

        return `http://localhost:4600${image}`;

    }


    // ========================================================
    // 13. SHOW ACTIVE CALL SCREEN
    // ========================================================

    function showActiveCallScreen(
        callType
    ) {

        console.log(
            "Showing active call:",
            callType
        );


        showElement(
            activeCallModal
        );


        // ====================================================
        // VIDEO CALL
        // ====================================================

        if (callType === "video") {

            videoCallContainer.classList.remove(
                "hidden"
            );


            voiceCallContainer.classList.add(
                "hidden"
            );


            cameraBtn.classList.remove(
                "hidden"
            );


            remoteVideo.classList.remove(
                "hidden"
            );

        }


        // ====================================================
        // VOICE CALL
        // ====================================================

        else {

            videoCallContainer.classList.add(
                "hidden"
            );


            voiceCallContainer.classList.remove(
                "hidden"
            );


            cameraBtn.classList.add(
                "hidden"
            );


            remoteVideo.classList.add(
                "hidden"
            );


            localVideo.classList.add(
                "hidden"
            );

        }

    }


    // ========================================================
    // 14. HIDE ACTIVE CALL
    // ========================================================

    function hideActiveCallScreen() {

        hideElement(
            activeCallModal
        );

    }


    // ========================================================
    // 15. GET MICROPHONE / CAMERA
    // ========================================================

    async function getLocalMedia(
        callType
    ) {

        try {

            console.log(
                "Requesting media:",
                callType
            );


            const constraints = {

                audio: true,

                video:
                    callType === "video"

            };


            localStream =
                await navigator.mediaDevices
                    .getUserMedia(
                        constraints
                    );


            console.log(
                "Local media received."
            );


            // ------------------------------------------------
            // VIDEO
            // ------------------------------------------------

            if (
                callType === "video" &&
                localVideo
            ) {

                localVideo.srcObject =
                    localStream;

                localVideo.classList.remove(
                    "hidden"
                );

            }


            return localStream;

        } catch (error) {

            console.error(
                "Media permission error:",
                error
            );


            alert(
                callType === "video"
                    ? "Please allow microphone and camera access."
                    : "Please allow microphone access."
            );


            throw error;

        }

    }


    // ========================================================
    // 16. CREATE PEER CONNECTION
    // ========================================================

    function createPeerConnection() {

        console.log(
            "Creating peer connection..."
        );


        peerConnection =
            new RTCPeerConnection(
                rtcConfiguration
            );


        // ====================================================
        // ADD LOCAL TRACKS
        // ====================================================

        if (localStream) {

            localStream
                .getTracks()
                .forEach(track => {

                    peerConnection.addTrack(
                        track,
                        localStream
                    );

                });

        }


        // ====================================================
        // RECEIVE REMOTE TRACK
        // ====================================================

        peerConnection.ontrack =
            event => {

                console.log(
                    "Remote track received."
                );


                if (!remoteStream) {

                    remoteStream =
                        new MediaStream();

                }


                remoteStream.addTrack(
                    event.track
                );


                // VIDEO CALL

                if (
                    currentCallType === "video"
                ) {

                    remoteVideo.srcObject =
                        remoteStream;

                }


                // VOICE CALL

                else {

                    remoteAudio.srcObject =
                        remoteStream;

                }

            };


        // ====================================================
        // ICE CANDIDATE
        // ====================================================

        peerConnection.onicecandidate =
            event => {

                if (
                    event.candidate &&
                    currentCallUserId
                ) {

                    console.log(
                        "Sending ICE candidate..."
                    );


                    window.socket.emit(
                        "iceCandidate",
                        {

                            candidate:
                                event.candidate,

                            receiverId:
                                currentCallUserId

                        }
                    );

                }

            };


        // ====================================================
        // CONNECTION STATE
        // ====================================================

        peerConnection.onconnectionstatechange =
            () => {

                if (!peerConnection) {

                    return;

                }
              const state = peerConnection.connectionState;


                console.log(
                    "WebRTC state:",
                    state
                );


                if (
                 state === "connected"
             ) {

              console.log(
              "Call connected. Starting timer."
           );

           updateCallStatus(
           "Connected"
          );

    startCallTimer();

}


                if (
                    state === "connected"
                ) {

                    updateCallStatus(
                        "Connected"
                    );

                }


                if (
                    state === "disconnected"
                ) {

                    updateCallStatus(
                        "Disconnected"
                    );

                }


                if (
                    state === "failed"
                ) {

                    updateCallStatus(
                        "Connection failed"
                    );

                }

            };


        return peerConnection;

    }


    // ========================================================
    // 17. START VOICE / VIDEO CALL
    // ========================================================

    async function startCall(
        callType
    ) {

        try {

            console.log(
                "Starting:",
                callType
            );


            // =================================================
            // SAVE STATE
            // =================================================

            currentCallType =
                callType;


            currentCallUserId =
                receiverId;


            // =================================================
            // CHECK RECEIVER
            // =================================================

            if (!currentCallUserId) {

                console.error(
                    "Receiver ID missing."
                );

                alert(
                    "Receiver not found."
                );

                return;

            }


            // =================================================
            // GET MEDIA
            // =================================================

            await getLocalMedia(
                callType
            );


            // =================================================
            // CREATE PEER
            // =================================================

            createPeerConnection();


            // =================================================
            // CREATE OFFER
            // =================================================

            const offer =
                await peerConnection.createOffer();


            await peerConnection.setLocalDescription(
                offer
            );


            console.log(
                "Sending call..."
            );


            // =================================================
            // SEND CALL
            // =================================================

            window.socket.emit(
                "callUser",
                {

                    callerId:
                        user.id,

                    receiverId:
                        currentCallUserId,

                    callType:
                        callType,

                    offer:
                        offer,

                    callerName:
                        user.userName,

                    callerImage:
                        user.profileImage

                }
            );


            // =================================================
            // UPDATE UI
            // =================================================

            const receiverName =
                document.getElementById(
                    "receiverName"
                );


            const receiverImage =
                document.getElementById(
                    "receiverImage"
                );


            updateCallUser(
                receiverName
                    ? receiverName.textContent
                    : "Calling...",
                receiverImage
                    ? receiverImage.src
                    : null
            );


            showActiveCallScreen(
                callType
            );


            updateCallStatus(
                "Calling..."
            );


        } catch (error) {

            console.error(
                "Could not start call:",
                error
            );


            cleanupCall();

        }

    }


    // ========================================================
    // 18. VOICE CALL BUTTON
    // ========================================================

    if (voiceCallBtn) {

        voiceCallBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Voice call button clicked"
                );


                startCall(
                    "voice"
                );

            }
        );

    }


    // ========================================================
    // 19. VIDEO CALL BUTTON
    // ========================================================

    if (videoCallBtn) {

        videoCallBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Video call button clicked"
                );


                startCall(
                    "video"
                );

            }
        );

    }


    // ========================================================
    // 20. INCOMING CALL
    // ========================================================

    window.socket.on(
        "incomingCall",
        data => {

            console.log(
                "Incoming call:",
                data
            );


            // =================================================
            // SAVE CALL INFORMATION
            // =================================================

            currentCallUserId =
                data.callerId;


            currentCallType =
                data.callType || "voice";


            pendingOffer =
                data.offer;


            console.log(
                "Caller ID:",
                currentCallUserId
            );


            console.log(
                "Call type:",
                currentCallType
            );


            // =================================================
            // CALLER NAME
            // =================================================

            incomingCallName.textContent =
                data.callerName ||
                "Incoming Call";


            // =================================================
            // CALLER IMAGE
            // =================================================

            incomingCallImage.src =
                getImageUrl(
                    data.callerImage
                );


            // =================================================
            // CALL TYPE
            // =================================================

            if (
                currentCallType === "video"
            ) {

                incomingCallType.textContent =
                    "Incoming video call...";


                acceptCallIcon.className =
                    "fa-solid fa-video text-xl";

            } else {

                incomingCallType.textContent =
                    "Incoming voice call...";


                acceptCallIcon.className =
                    "fa-solid fa-phone text-xl";

            }


            // =================================================
            // SHOW INCOMING MODAL
            // =================================================

            showElement(
                incomingCallModal
            );

        }
    );


    // ========================================================
    // 21. ACCEPT CALL
    // ========================================================

    if (acceptCallBtn) {

        acceptCallBtn.addEventListener(
            "click",
            async () => {

                try {

                    console.log(
                        "Accepting call..."
                    );


                    if (!pendingOffer) {

                        console.error(
                            "No call offer found."
                        );

                        return;

                    }


                    // =========================================
                    // HIDE INCOMING MODAL
                    // =========================================

                    hideElement(
                        incomingCallModal
                    );


                    // =========================================
                    // GET MEDIA
                    // =========================================

                    await getLocalMedia(
                        currentCallType
                    );


                    // =========================================
                    // CREATE PEER
                    // =========================================

                    createPeerConnection();


                    // =========================================
                    // SET OFFER
                    // =========================================

                    await peerConnection.setRemoteDescription(
                        new RTCSessionDescription(
                            pendingOffer
                        )
                    );

                    for (
                      const candidate of pendingIceCandidates
                    ) {

              try {

                  await peerConnection.addIceCandidate(
                      new RTCIceCandidate(candidate)
                  );

                      console.log(
                    "Queued ICE candidate added."
                 );

             } catch (error) {

                    console.error(
                   "Queued ICE candidate error:",
                error
              );

           }

       }

pendingIceCandidates = [];


                    // =========================================
                    // CREATE ANSWER
                    // =========================================

                    const answer =
                        await peerConnection.createAnswer();


                    await peerConnection.setLocalDescription(
                        answer
                    );


                    // =========================================
                    // SEND ANSWER
                    // =========================================

                    window.socket.emit(
                        "acceptCall",
                        {

                            callerId:
                                currentCallUserId,

                            receiverId:
                                user.id,

                            answer:
                                answer

                        }
                    );


                    // =========================================
                    // SHOW ACTIVE CALL
                    // =========================================

                    showActiveCallScreen(
                        currentCallType
                    );


                    updateCallUser(
                        incomingCallName.textContent,
                        incomingCallImage.src
                    );


                    updateCallStatus(
                        "Connecting..."
                    );


                    // =========================================
                    // CLEAR OFFER
                    // =========================================

                    pendingOffer =
                        null;


                } catch (error) {

                    console.error(
                        "Error accepting call:",
                        error
                    );


                    cleanupCall();

                }

            }
        );

    }


    // ========================================================
    // 22. REJECT CALL
    // ========================================================

    if (rejectCallBtn) {

        rejectCallBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Call rejected."
                );


                if (!currentCallUserId) {

                    console.error(
                        "Caller ID missing."
                    );

                    return;

                }


                window.socket.emit(
                    "rejectCall",
                    {

                        callerId:
                            currentCallUserId,

                        receiverId:
                            user.id

                    }
                );


                hideElement(
                    incomingCallModal
                );


                pendingOffer =
                    null;


                currentCallUserId =
                    null;


                currentCallType =
                    "voice";

            }
        );

    }


    // ========================================================
    // 23. CALL REJECTED
    // ========================================================

    window.socket.on(
        "callRejected",
        data => {

            console.log(
                "Call rejected:",
                data
            );


            updateCallStatus(
                "Call declined"
            );


            setTimeout(
                () => {

                    cleanupCall();

                },
                1000
            );

        }
    );


    // ========================================================
    // 24. CALL ACCEPTED
    // ========================================================

    window.socket.on(
        "callAccepted",
        async data => {

            try {

                console.log(
                    "Call accepted."
                );


                if (!peerConnection) {

                    console.error(
                        "Peer connection missing."
                    );

                    return;

                }


                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(
                        data.answer
                    )
                );


                updateCallStatus(
                    "Connecting..."
                );


            } catch (error) {

                console.error(
                    "Error handling accepted call:",
                    error
                );

            }

        }
    );


    // ========================================================
    // 25. RECEIVE ICE CANDIDATE
    // ========================================================

   window.socket.on(
    "iceCandidate",
    async data => {

        try {

            if (!data.candidate) {
                return;
            }

            console.log(
                "ICE candidate received."
            );

            // If remote description is not ready yet,
            // save the candidate for later.
            if (
                !peerConnection ||
                !peerConnection.remoteDescription
            ) {

                console.log(
                    "Queuing ICE candidate..."
                );

                pendingIceCandidates.push(
                    data.candidate
                );

                return;
            }

            await peerConnection.addIceCandidate(
                new RTCIceCandidate(
                    data.candidate
                )
            );

            console.log(
                "ICE candidate added."
            );

        } catch (error) {

            console.error(
                "ICE candidate error:",
                error
            );

        }

    }
);


    // ========================================================
    // 26. END CALL
    // ========================================================

    if (endCallBtn) {

        endCallBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Ending call..."
                );


                if (currentCallUserId) {

                    window.socket.emit(
                        "endCall",
                        {

                            callerId:
                                user.id,

                            receiverId:
                                currentCallUserId

                        }
                    );

                }


                cleanupCall();

            }
        );

    }


    // ========================================================
    // 27. CALL ENDED
    // ========================================================

    window.socket.on(
        "callEnded",
        data => {

            console.log(
                "Call ended:",
                data
            );


            updateCallStatus(
                "Call ended"
            );


            setTimeout(
                () => {

                    cleanupCall();

                },
                700
            );

        }
    );


    // ========================================================
    // 28. MUTE MICROPHONE
    // ========================================================

    if (muteBtn) {

        muteBtn.addEventListener(
            "click",
            () => {

                if (!localStream) {

                    return;

                }


                const audioTracks =
                    localStream.getAudioTracks();


                if (
                    audioTracks.length === 0
                ) {

                    return;

                }


                audioTracks.forEach(
                    track => {

                        track.enabled =
                            !track.enabled;

                    }
                );


                const isMuted =
                    !audioTracks[0].enabled;


                if (isMuted) {

                    muteIcon.className =
                        "fa-solid fa-microphone-slash";


                    muteBtn.classList.remove(
                        "bg-gray-800/90"
                    );


                    muteBtn.classList.add(
                        "bg-red-600"
                    );

                } else {

                    muteIcon.className =
                        "fa-solid fa-microphone";


                    muteBtn.classList.remove(
                        "bg-red-600"
                    );


                    muteBtn.classList.add(
                        "bg-gray-800/90"
                    );

                }


                console.log(
                    isMuted
                        ? "Microphone muted"
                        : " Microphone unmuted"
                );

            }
        );

    }


    // ========================================================
    // 29. CAMERA ON / OFF
    // ========================================================

    if (cameraBtn) {

        cameraBtn.addEventListener(
            "click",
            () => {

                if (!localStream) {

                    return;

                }


                const videoTracks =
                    localStream.getVideoTracks();


                if (
                    videoTracks.length === 0
                ) {

                    return;

                }


                videoTracks.forEach(
                    track => {

                        track.enabled =
                            !track.enabled;

                    }
                );


                const cameraOff =
                    !videoTracks[0].enabled;


                if (cameraOff) {

                    cameraIcon.className =
                        "fa-solid fa-video-slash";


                    cameraBtn.classList.remove(
                        "bg-gray-800/90"
                    );


                    cameraBtn.classList.add(
                        "bg-red-600"
                    );

                } else {

                    cameraIcon.className =
                        "fa-solid fa-video";


                    cameraBtn.classList.remove(
                        "bg-red-600"
                    );


                    cameraBtn.classList.add(
                        "bg-gray-800/90"
                    );

                }


                console.log(
                    cameraOff
                        ? "Camera OFF"
                        : "Camera ON"
                );

            }
        );

    }

// ========================================================
//startcalltimer
// ========================================================
let callTimerStarted = false;
function startCallTimer() {

    if (callTimerStarted) {
        return;
    }

    clearInterval(callTimerInterval);

    callStartTime = Date.now();
    callTimerStarted = true;

    const videoTimer = document.getElementById("callTimer");
    const voiceTimer = document.getElementById("voiceCallTimer");

    if (videoTimer) videoTimer.textContent = "00:00";
    if (voiceTimer) voiceTimer.textContent = "00:00";

    callTimerInterval = setInterval(() => {

        const elapsed = Math.floor(
            (Date.now() - callStartTime) / 1000
        );

        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        const formattedTime =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (videoTimer) videoTimer.textContent = formattedTime;
        if (voiceTimer) voiceTimer.textContent = formattedTime;

    }, 1000);
}
// ========================================================
// update calltimer
// ========================================================
function updateCallTimer(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    const formattedTime =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    // Video timer
    const timerElement =
        document.getElementById("callTimer");

    if (timerElement) {

        timerElement.textContent =
            formattedTime;

    }


    // Voice timer
    if (voiceCallTimer) {

        voiceCallTimer.textContent =
            formattedTime;

    }

}
// ========================================================
// stopcalltimer
// ========================================================
function stopCallTimer() {

    clearInterval(callTimerInterval);

    callTimerInterval = null;
    callStartTime = null;
    callTimerStarted = false;

    // Reset video timer
    const videoTimer = document.getElementById("callTimer");

    if (videoTimer) {
        videoTimer.textContent = "00:00";
    }

    // Reset voice timer
    const voiceTimer = document.getElementById("voiceCallTimer");

    if (voiceTimer) {
        voiceTimer.textContent = "00:00";
    }
}




    // ========================================================
    // 30. CLEANUP CALL
    // ========================================================

    function cleanupCall() {

        console.log(
            "Cleaning up call..."
        );
          // STOP CALL TIMER
           stopCallTimer();

        // ====================================================
        // STOP LOCAL MEDIA
        // ====================================================

        if (localStream) {

            localStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );


            localStream =
                null;

        }


        // ====================================================
        // CLOSE PEER CONNECTION
        // ====================================================

        if (peerConnection) {

            try {

                peerConnection.close();

            } catch (error) {

                console.error(
                    "Error closing peer:",
                    error
                );

            }


            peerConnection =
                null;

        }


        // ====================================================
        // CLEAR STREAMS
        // ====================================================

        remoteStream =
            null;


        if (localVideo) {

            localVideo.srcObject =
                null;

        }


        if (remoteVideo) {

            remoteVideo.srcObject =
                null;

        }


        if (remoteAudio) {

            remoteAudio.srcObject =
                null;

        }


        // ====================================================
        // HIDE MODALS
        // ====================================================

        hideElement(
            incomingCallModal
        );


        hideActiveCallScreen();


        // ====================================================
        // RESET STATE
        // ====================================================

        pendingOffer =
            null;


        currentCallUserId =
            null;


        currentCallType =
            "voice";


        // ====================================================
        // RESET BUTTONS
        // ====================================================

        if (muteBtn) {

            muteBtn.classList.remove(
                "bg-red-600"
            );

            muteBtn.classList.add(
                "bg-gray-800/90"
            );

        }


        if (muteIcon) {

            muteIcon.className =
                "fa-solid fa-microphone";

        }


        if (cameraBtn) {

            cameraBtn.classList.remove(
                "bg-red-600"
            );

            cameraBtn.classList.add(
                "bg-gray-800/90"
            );

        }


        if (cameraIcon) {

            cameraIcon.className =
                "fa-solid fa-video";

        }


        console.log(
            "Call cleanup complete."
        );

    }


    // ========================================================
    // 31. INITIAL CALL SCREEN
    // ========================================================

    if (videoCallContainer) {

        videoCallContainer.classList.add(
            "hidden"
        );

    }


    if (voiceCallContainer) {

        voiceCallContainer.classList.remove(
            "hidden"
        );

    }


    if (cameraBtn) {

        cameraBtn.classList.add(
            "hidden"
        );

    }


    console.log(
        "PingoApp call system ready."
    );

});







// const socket = window.socket;

// console.log("call.js socket:", socket);
// console.log("window.socket =", window.socket);

// document.addEventListener("DOMContentLoaded", () => {


//     // ============================================
//     // USER DATA
//     // ============================================

//     const user = JSON.parse(
//         localStorage.getItem("user")
//     );

//     const receiverId =
//         localStorage.getItem("receiverId");

//     if (!user || !receiverId) {

//         console.log(
//             "Call system: user or receiver missing"
//         );

//         return;

//     }



//     // =================================================
//     // WEBRTC VARIABLES
//     // =================================================

//     let peerConnection = null;

//     let localStream = null;

//     let remoteStream = null;

//     let currentCallUserId = receiverId;

//     let currentCallType = "voice";

//     let isCaller = false;


//     // =================================================
//     // STUN SERVER
//     // =================================================

//     const rtcConfiguration = {

//         iceServers: [

//             {
//                 urls:
//                     "stun:stun.l.google.com:19302"
//             }

//         ]

//     };

//     // ============================================
//     // ELEMENTS
//     // ============================================
// const incomingCallModal =
//         document.getElementById("incomingCallModal");

// const incomingCallImage =
//         document.getElementById("incomingCallImage");

//  const incomingCallName =
//         document.getElementById("incomingCallName");

//           const incomingCallType =
//     document.getElementById("incomingCallType");


//     const rejectCallBtn =
//         document.getElementById("rejectCallBtn");

//     const acceptCallBtn =
//         document.getElementById("acceptCallBtn");    

//     const acceptCallIcon =
//         document.getElementById("acceptCallIcon");

//      const activeCallModal =
//         document.getElementById("activeCallModal");

//      const activeCallImage =
//         document.getElementById("activeCallImage");
        
//     const remoteVideo =
//         document.getElementById("remoteVideo");

//     const voiceCallBtn =
//         document.getElementById("voiceCallBtn");

//      const videoCallBtn =
//      document.getElementById("videoCallBtn");   

//     const localVideo =
//         document.getElementById("localVideo");    

//     const activeCallName =
//         document.getElementById("activeCallName");

//     const callStatus =
//         document.getElementById("callStatus");    

//     const muteBtn = 
//     document.getElementById( "muteBtn");

//    const muteIcon =
//         document.getElementById("muteIcon");

//     const cameraBtn =
//         document.getElementById("cameraBtn" );

//     const cameraIcon =
//      document.getElementById("cameraIcon");

//     const endCallBtn =
//         document.getElementById("endCallBtn");


//     // ============================================
//     // CHECK BUTTONS
//     // ============================================

//     console.log(
//         "Voice button:",
//         voiceCallBtn
//     );

//     console.log(
//         "video button:",
//         videoCallBtn
//     );



//     // ============================================
//     // VOICE CALL
//     // ============================================

//     voiceCallBtn.addEventListener(
//         "click",
//         () => {

//             console.log(
//                 "Voice call button clicked"
//             );

//              console.log("My user ID:", user.id);
//              console.log("Receiver ID:", receiverId);

//            window.socket.emit(
//                 "callUser",
//                 {
//                     callerId: user.id,
//                     receiverId:receiverId,
//                     callType: "voice"
//                 }
//             );

//             activeCallName.textContent =
//                 document.getElementById(
//                     "receiverName"
//                 ).textContent;

//             activeCallModal.classList.remove(
//                 "hidden"
//             );

//             activeCallModal.classList.add(
//                 "flex"
//             );

//             callStatus.textContent =
//                 "Calling...";

//         }
//     );

//      videoCallBtn.addEventListener(
//         "click",
//         () => {

//             console.log(
//                 "Video call button clicked"
//             );

//              console.log("My user ID:", user.id);
//              console.log("Receiver ID:", receiverId);

//            window.socket.emit(
//                 "callUser",
//                 {
//                     callerId: user.id,
//                     receiverId:receiverId,
//                     callType: "video"
//                 }
//             );

//             activeCallName.textContent =
//                 document.getElementById(
//                     "receiverName"
//                 ).textContent;

//             activeCallModal.classList.remove(
//                 "hidden"
//             );

//             activeCallModal.classList.add(
//                 "flex"
//             );

//             callStatus.textContent =
//                 "Calling...";

//         }
//     );



//     // ============================================
//     // INCOMING CALL
//     // ============================================

//   window.socket.on("incomingCall", (data) => {

//     console.log("Incoming call:", data);

//     // ============================================
//     // SAVE CALLER ID
//     // ============================================

//     localStorage.setItem(
//         "callerId",
//         String(data.callerId)
//     );

//     console.log(
//         "Saved caller ID:",
//         data.callerId
//     );

//     // ============================================
//     // SHOW INCOMING CALL MODAL
//     // ============================================

//     incomingCallModal.classList.remove("hidden");
//     incomingCallModal.classList.add("flex");

//     // ============================================
//     // CALLER NAME
//     // ============================================

//     incomingCallName.textContent =
//         data.callerName || "Incoming Call";

//     // ============================================
//     // CALLER IMAGE
//     // ============================================

//     if (data.callerImage) {

//         incomingCallImage.src =
//             `http://localhost:4600${data.callerImage}`;

//     } else {

//         incomingCallImage.src =
//             "./images/default-avatar.png";

//     }

//     // ============================================
//     // CALL TYPE
//     // ============================================

//     if (data.callType === "video") {

//         incomingCallType.textContent =
//             "Incoming video call...";

//         acceptCallIcon.className =
//             "fa-solid fa-video";

//     } else {

//         incomingCallType.textContent =
//             "Incoming voice call...";

//         acceptCallIcon.className =
//             "fa-solid fa-phone";

//     }

// });
//     // ============================================
//     // ACCEPT CALL
//     // ============================================

//     acceptCallBtn.addEventListener(
//         "click",
//         () => {

//             console.log(
//                 "Call accepted"
//             );

//             incomingCallModal.classList.add(
//                 "hidden"
//             );

//             incomingCallModal.classList.remove(
//                 "flex"
//             );

//             activeCallModal.classList.remove(
//                 "hidden"
//             );

//             activeCallModal.classList.add(
//                 "flex"
//             );

//             callStatus.textContent =
//                 "Connected";

//             window.socket.emit(
//                 "acceptCall",
//                 {
//                     callerId:
//                         localStorage.getItem(
//                             "callerId"
//                         ),
//                     receiverId:
//                         user.id
//                 }
//             );

//         }
//     );


//     // ============================================
//     // REJECT CALL
//     // ============================================

//    rejectCallBtn.addEventListener(
//     "click",
//     () => {

//         console.log("Call rejected");

//         const callerId =
//             localStorage.getItem("callerId");

//         if (!callerId) {

//             console.log(
//                 "Cannot reject call: caller ID is missing"
//             );

//             return;
//         }

//         window.socket.emit(
//             "rejectCall",
//             {
//                 callerId: callerId,
//                 receiverId: String(user.id)
//             }
//         );

//         // Hide incoming call modal

//         incomingCallModal.classList.add("hidden");
//         incomingCallModal.classList.remove("flex");

//         // Remove saved caller

//         localStorage.removeItem("callerId");

//     }
// );
//     // ============================================
//     // END CALL
//     // ============================================

//     endCallBtn.addEventListener(
//         "click",
//         () => {

//             console.log(
//                 "Ending call"
//             );

//             activeCallModal.classList.add(
//                 "hidden"
//             );

//             activeCallModal.classList.remove(
//                 "flex"
//             );

//             window.socket.emit(
//                 "endCall",
//                 {
//                     callerId: user.id,
//                     receiverId: receiverId
//                 }
//             );

//         }
//     );


//     // ============================================
//     // CALL ENDED
//     // ============================================

//    window.socket.on(
//         "callEnded",
//         () => {

//             activeCallModal.classList.add(
//                 "hidden"
//             );

//             activeCallModal.classList.remove(
//                 "flex"
//             );

//             callStatus.textContent =
//                 "Call ended";

//         }
//     );

// });

// window.socket.on(
//     "callRejected",
//     () => {

//         console.log(
//             "Call was rejected"
//         );

//         activeCallModal.classList.add(
//             "hidden"
//         );

//         activeCallModal.classList.remove(
//             "flex"
//         );

//         callStatus.textContent =
//             "Call rejected";

//     }
// );
   