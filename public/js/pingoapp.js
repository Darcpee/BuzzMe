 const getStartedBtn = document.getElementById("getStartedBtn");

        const loginBtn = document.getElementById("loginBtn");

        const loadingOverlay = document.getElementById("loadingOverlay");



        /* ------------------------------
            Get Started Button
        ------------------------------- */

        getStartedBtn.addEventListener("click", () => {

            loadingOverlay.classList.remove("hidden");
            loadingOverlay.classList.add("flex");

            setTimeout(() => {

                loadingOverlay.classList.remove("flex");
                loadingOverlay.classList.add("hidden");

                // Redirect to phone verification page
                window.location.href = "verifyphonenumber.html";

            }, 2000);

        });




        /* ------------------------------
            Login Button
        ------------------------------- */

        loginBtn.addEventListener("click", () => {

            window.location.href = "login.html";

        });




        /* ------------------------------
            Mobile Vibration Feedback
        ------------------------------- */

        document.querySelectorAll("button").forEach(button => {

            button.addEventListener("touchstart", () => {

                if (navigator.vibrate) {

                    navigator.vibrate(10);

                }

            });

        });