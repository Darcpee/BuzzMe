document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       ELEMENTS
    ========================================== */

    const registerForm = document.getElementById("registerForm");
    const verifyBtn = document.getElementById("verifyBtn");
    const userName = document.getElementById("userName");
    const pinInputs = document.querySelectorAll(".otp-input");

    /* ==========================================
       OTP INPUT
    ========================================== */

    pinInputs.forEach((input, index) => {

        input.addEventListener("input", () => {

            input.value = input.value.replace(/\D/g, "");

            if (input.value.length > 1) {
                input.value = input.value.charAt(0);
            }

            if (input.value !== "" && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }

        });

        input.addEventListener("keydown", (e) => {

            if (
                e.key === "Backspace" &&
                input.value === "" &&
                index > 0
            ) {
                pinInputs[index - 1].focus();
            }

        });

    });

    /* ==========================================
       VERIFY OTP
    ========================================== */

   registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    let pin = "";

    pinInputs.forEach(input => {
        pin += input.value;
    });

    if (userName.value.trim() === "") {
        alert("Please enter your username.");
        return;
    }

    if (pin.length !== 6) {
        alert("Please enter your 6-digit PIN.");
        return;
    }

    verifyBtn.disabled = true;

    verifyBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Logging in...
    `;

    try {

        const response = await fetch("http://localhost:4600/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                userName: userName.value.trim(),
                pin: pin

            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            verifyBtn.disabled = false;

            verifyBtn.innerHTML = `
                <i class="fa-solid fa-right-to-bracket"></i>
                Login
            `;

            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successful!");

        window.location.href = "chatscreen.html";

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

        verifyBtn.disabled = false;

        verifyBtn.innerHTML = `
            <i class="fa-solid fa-right-to-bracket"></i>
            Login
        `;

    }

});

});