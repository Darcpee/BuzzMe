/* ==========================================================
   COUNTRY PICKER
========================================================== */

/* ---------------- ELEMENTS ---------------- */

const countryBtn = document.getElementById("countryBtn");

const countryModal = document.getElementById("countryModal");

const closeCountryModal = document.getElementById("closeCountryModal");

const countrySearch = document.getElementById("countrySearch");

const countryList = document.getElementById("countryList");

const countryFlag = document.getElementById("countryFlag");

const countryName = document.getElementById("countryName");

const countryCode = document.getElementById("countryCode");


/* ---------------- DATA ---------------- */

let countries = [];

let selectedCountry = null;


/* ---------------- LOAD JSON ---------------- */

async function loadCountries() {

    try {

        const response = await fetch("./data/countries.json");

        countries = await response.json();

        renderCountries(countries);

        console.log("Countries Loaded");

    } catch (error) {

        console.error(error);

    }

}

loadCountries();
/* ==========================================================
   RENDER COUNTRIES
========================================================== */

function renderCountries(countryArray) {

    countryList.innerHTML = "";

    countryArray.forEach((country) => {

        const item = document.createElement("div");

        item.className =
            "flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition";

        item.innerHTML = `
            <div class="flex items-center gap-3">

                <span class="text-2xl">
                    ${country.flag}
                </span>

                <span class="font-medium">
                    ${country.name}
                </span>

            </div>

            <span class="text-gray-500 font-medium">
                ${country.dialCode}
            </span>
        `;


        /* Select Country */

        item.addEventListener("click", () => {

            selectedCountry = country;

            countryFlag.textContent = country.flag;

            countryName.textContent = country.name;

            countryCode.textContent = country.dialCode;

            countryModal.classList.add("hidden");

        });

        countryList.appendChild(item);

    });

}
/* ==========================================================
   OPEN COUNTRY MODAL
========================================================== */

countryBtn.addEventListener("click", () => {

    countryModal.classList.remove("hidden");

    countrySearch.value = "";

    renderCountries(countries);

    countrySearch.focus();

});


/* ==========================================================
   CLOSE COUNTRY MODAL
========================================================== */

closeCountryModal.addEventListener("click", () => {

    countryModal.classList.add("hidden");

});


/* ==========================================================
   CLOSE WHEN CLICKING OUTSIDE
========================================================== */

countryModal.addEventListener("click", (e) => {

    if (e.target === countryModal) {

        countryModal.classList.add("hidden");

    }

});


/* ==========================================================
   SEARCH COUNTRIES
========================================================== */

countrySearch.addEventListener("input", (e) => {

    const search = e.target.value.trim().toLowerCase();

    const filteredCountries = countries.filter(country => {

        return (

            country.name.toLowerCase().includes(search) ||

            country.dialCode.includes(search) ||

            country.code.toLowerCase().includes(search)

        );

    });

    renderCountries(filteredCountries);

});


/* ==========================================================
   DEFAULT COUNTRY
========================================================== */

window.addEventListener("DOMContentLoaded", () => {

    const defaultCountry = {

        name: "Nigeria",

        dialCode: "+234",

        code: "NG",

        flag: "🇳🇬"

    };

    selectedCountry = defaultCountry;

    countryFlag.textContent = defaultCountry.flag;

    countryName.textContent = defaultCountry.name;

    countryCode.textContent = defaultCountry.dialCode;

});