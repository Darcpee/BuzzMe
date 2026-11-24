
const registerForm = document.getElementById("registerForm");
const phoneInput = document.getElementById("phoneInput");
const pinInputs = document.querySelectorAll(".otp-input");
const registerBtn = document.getElementById("nextBtn");

/* ===========================================
   PHONE NUMBER
=========================================== */

phoneInput.addEventListener("input", (e) => {

    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 15) {

        value = value.substring(0, 15);

    }

    e.target.value = value;

});

/* ===========================================
   PIN INPUT
=========================================== */

pinInputs.forEach((input, index) => {

    input.addEventListener("input", (e) => {

        let value = e.target.value.replace(/\D/g, "");

        if (value.length > 1) {

            value = value.charAt(0);

        }

        input.value = value;

        if (value !== "" && index < pinInputs.length - 1) {

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

/* ===========================================
   REGISTER
=========================================== */

registerForm.addEventListener("submit", (e) => {

    e.preventDefault();

    /* ---------------- PHONE ---------------- */

    const phone = phoneInput.value.trim().replace(/\D/g, "");

    if (phone.length < 6) {

        alert("Enter a valid phone number.");

        phoneInput.focus();

        return;

    }

    /* ---------------- PIN ---------------- */

    let pin = "";

    pinInputs.forEach(input => {

        pin += input.value;

    });

    if (!/^\d{6}$/.test(pin)) {

        alert("Enter a valid 6-digit PIN.");

        pinInputs[0].focus();

        return;

    }

    /* ---------------- COUNTRY ---------------- */

    if (!selectedCountry) {

        alert("Please select your country.");

        return;

    }

    /* ---------------- SAVE TEMP DATA ---------------- */

    const registrationData = {

        phoneNumber: selectedCountry.dialCode + phone,

        pin,

        country: selectedCountry.name,

        countryCode: selectedCountry.code,

        dialCode: selectedCountry.dialCode

    };

    localStorage.setItem(

        "registrationData",

        JSON.stringify(registrationData)

    );

    console.log(

        "Saved Registration Data:",

        registrationData

    );

    registerBtn.disabled = true;

    registerBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Next...
    `;

    setTimeout(() => {

        window.location.href = "profile.html";

    }, 1000);

});

/* ===========================================
   MOBILE VIBRATION
=========================================== */

document.querySelectorAll("button").forEach(button => {

    button.addEventListener("touchstart", () => {

        if ("vibrate" in navigator) {

            navigator.vibrate(10);

        }

    });

});