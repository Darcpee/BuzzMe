document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("profileForm");
    const userName = document.getElementById("userName");
    const finishBtn = document.getElementById("finishBtn");

    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarPlaceholder = document.getElementById("avatarPlaceholder");

    const registrationData = JSON.parse(
        localStorage.getItem("registrationData")
    );

    if (!registrationData) {

        alert("Please verify your phone number first.");

        window.location.href = "/verifyphonenumber.html";

        return;
    }

    /* ===========================
       IMAGE PREVIEW
    =========================== */

    avatarInput.addEventListener("change", () => {

        const file = avatarInput.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {

            avatarPreview.src = e.target.result;

            avatarPreview.classList.remove("hidden");

            avatarPlaceholder.classList.add("hidden");

        };

        reader.readAsDataURL(file);

    });

    /* ===========================
       ENABLE BUTTON
    =========================== */

    function checkForm() {

        if (userName.value.trim() !== "") {

            finishBtn.disabled = false;

            finishBtn.classList.remove(
                "opacity-50",
                "cursor-not-allowed"
            );

        } else {

            finishBtn.disabled = true;

            finishBtn.classList.add(
                "opacity-50",
                "cursor-not-allowed"
            );

        }

    }

    checkForm();

    userName.addEventListener("input", checkForm);

    /* ===========================
       SUBMIT FORM
    =========================== */

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        finishBtn.disabled = true;

        finishBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Creating Account...
        `;

        const formData = new FormData();

        formData.append(
            "userName",
            userName.value.trim()
        );

        formData.append(
            "phoneNumber",
            registrationData.phoneNumber
        );

        formData.append(
            "pin",
            registrationData.pin
        );

        formData.append(
            "country",
            registrationData.country
        );

        formData.append(
            "countryCode",
            registrationData.countryCode
        );

        formData.append(
            "dialCode",
            registrationData.dialCode
        );

        if (avatarInput.files.length > 0) {

            formData.append(
                "profileImage",
                avatarInput.files[0]
            );

        }

        console.log("========== FORM DATA ==========");

        for (const pair of formData.entries()) {

            console.log(pair[0], pair[1]);

        }

        try {

            console.log("Sending request...");

            const response = await fetch(
                "http://localhost:4600/registerUser",
                {
                    method: "POST",
                    body: formData
                }
            );

            console.log("Response received");

            const data = await response.json();

            console.log("Status:", response.status);
            console.log("Response:", data);

            if (!response.ok) {

                alert(data.message || "Registration failed.");

                finishBtn.disabled = false;

                finishBtn.innerHTML = `
                    Finish Setup
                    <i class="fa-solid fa-arrow-right"></i>
                `;

                return;

            }

            console.log("Registration successful!");

            localStorage.removeItem("registrationData");
            localStorage.removeItem("selectedCountry");

            alert("Account created successfully!");

            console.log("Redirecting to OTP page...");

            // Redirect after 500ms
            setTimeout(() => {

                window.location.href = "otp.html";

            }, 500);

        } catch (error) {

            console.error("Fetch Error:", error);

            alert("Unable to connect to the server.");

            finishBtn.disabled = false;

            finishBtn.innerHTML = `
                Finish Setup
                <i class="fa-solid fa-arrow-right"></i>
            `;

        }

    });

});
