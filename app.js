const dropdowns = document.querySelectorAll(".dropdown select");
const btn      = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr   = document.querySelector(".to select");
const msg      = document.querySelector(".msg");

// Populate both dropdowns with currency options
for (let select of dropdowns) {
    for (let code in countryList) {
        let opt = document.createElement("option");
        opt.value = code;
        opt.innerText = code;
        if (select.name === "from" && code === "USD") opt.selected = true;
        if (select.name === "to"   && code === "INR") opt.selected = true;
        select.append(opt);
    }
    select.addEventListener("change", (e) => updateFlag(e.target));
}

// Update country flag when dropdown changes
function updateFlag(element) {
    const code = countryList[element.value];
    if (!code) return;
    const img = element.parentElement.querySelector("img");
    if (img) img.src = `https://flagsapi.com/${code}/flat/64.png`;
}

// Fetch exchange rate from API
// API format: /v1/currencies/{from}.json
// Response:   { "usd": { "inr": 83.4, "eur": 0.92, ... } }
async function fetchRate(from, to) {
    const urls = [
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`,
        `https://latest.currency-api.pages.dev/v1/currencies/${from}.json`
    ];

    for (let url of urls) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            const rate = data[from] && data[from][to];
            if (typeof rate === "number") return rate;
        } catch (e) {
            continue;
        }
    }
    return null;
}

// Main function: get amount, fetch rate, show result
async function updateExchangeRate() {
    let amountEl = document.querySelector(".amount input");
    let amtVal   = parseFloat(amountEl.value);
    if (!amtVal || amtVal < 1) { amtVal = 1; amountEl.value = "1"; }

    const from = fromCurr.value.toLowerCase();
    const to   = toCurr.value.toLowerCase();

    msg.innerText = "Fetching rate...";
    btn.disabled  = true;

    const rate = await fetchRate(from, to);

    if (rate !== null) {
        const result = (amtVal * rate).toFixed(4);
        msg.innerText = `${amtVal} ${fromCurr.value} = ${result} ${toCurr.value}`;
    } else {
        msg.innerText = "Could not fetch rate. Check internet & try again.";
    }

    btn.disabled = false;
}

// Button click
btn.addEventListener("click", (e) => {
    e.preventDefault();
    updateExchangeRate();
});

// Run on page load
window.addEventListener("load", () => updateExchangeRate());
