// Global variable to store the Turnstile token
let TURNSTILE_TOKEN = "";

// Function to initialize Turnstile when the window loads
window.onloadTurnstileCallback = function () {
    turnstile.render("#example-container", {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onTurnstileSuccess,
    });
};

// Callback function triggered when Turnstile validation is successful
function onTurnstileSuccess(token) {
    TURNSTILE_TOKEN = token;
    document.getElementById("btn-search").disabled = false;
}

// Function to handle the Enter key press event
function handleEnterKey(event) {
    if (event.key === "Enter") {
        searchSubdomain();
    }
}

// Function to handle the search input event
function handleSearchInput(event) {
    event.target.value = event.target.value.toLowerCase().trim();
}

// Function to clear previous search results and errors
function clearPreviousSearchResults() {
    document.getElementById("searchError").innerHTML = "";
    document.getElementById("result-list").innerHTML = "";
}

// Function to display search error messages
function displaySearchError(message) {
    document.getElementById("searchError").innerHTML = `<p>${message}</p>`;
}

// Function to fetch subdomain search results from the server
async function searchSubdomain() {
    const subdomain = document.getElementById("subdomain-search-input").value;
    clearPreviousSearchResults();
    if (!subdomain) {
        displaySearchError("Silakan masukkan subdomain yang ingin dicari.");
        return;
    }
    try {
        const response = await fetchSubdomainData(subdomain);
        const data = await response.json();
        if (data.success) {
            if (data.data.length > 0) {
                displaySubdomainSearchResults(data.data);
                showSearchResultContainer();
                giveEventToCreateButtons();
            } else {
                displaySearchError("Subdomain tidak tersedia.");
            }
        } else {
            displaySearchError(data.message);
        }
    } catch (error) {
        displaySearchError(`Error: ${error.message}`);
    }
}

// Function to make the API call to search for subdomains
async function fetchSubdomainData(subdomain) {
    return fetch(`${SERVER_URL}/api/subdomain/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: subdomain,
            turnstile: TURNSTILE_TOKEN,
        }),
    });
}

// Function to display the search results in the UI
function displaySubdomainSearchResults(data) {
    const resultList = document.getElementById("result-list");
    data.forEach((item) => {
        const listItem = createSubdomainListItem(item);
        resultList.appendChild(listItem);
    });
}

// Function to show the search result container
function showSearchResultContainer() {
    document.getElementById("subdomainsContainer").hidden = false;
}
