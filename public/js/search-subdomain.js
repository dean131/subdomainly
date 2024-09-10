// Global variable to store the Turnstile token
let TURNSTILE_TOKEN = "";

// Function to initialize Turnstile when the window loads
window.onloadTurnstileCallback = function () {
    turnstile.render("#turnstile-container", {
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
    if (!subdomain) {
        displaySearchError("Silakan masukkan subdomain yang ingin dicari.");
        return;
    }
    try {
        const response = await fetchSubdomainData(subdomain);
        const data = await response.json();
        if (data.success) {
            if (data.data.length > 0) {
                clearPreviousSearchResults();
                displaySubdomainSearchResults(data.data);
                toggleSearchResultContainer();
            } else {
                makeAlert("Subdomain tidak ditemukan.", "warning");
            }
        } else {
            makeAlert(data.message, "danger");
        }
    } catch (error) {
        makeAlert(`Error: ${error.message}`, "danger");
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

// Function to create a subdomain list item
function createSubdomainListItem(item) {
    const listItem = document.createElement("a");
    listItem.className = "list-group-item list-group-item-action";

    const buttonHtml =
        item.status === "taken"
            ? createUnavailableButton()
            : createAvailableButton(item);

    const subdomainHtml =
        item.status === "taken"
            ? createUnavailableSubdomainHtml(item)
            : createAvailableSubdomainHtml(item);

    listItem.innerHTML = `
        <div class="row align-items-center justify-content-between px-2">
            ${subdomainHtml}
            ${buttonHtml}
        </div>
    `;
    return listItem;
}

// Function to create unavailable button HTML
function createUnavailableButton() {
    return `
        <button
            type="button"
            class="btn btn-outline-danger col-md-auto"
            disabled>
                Tidak Tersedia
        </button>
    `;
}

// Function to create available button HTML
function createAvailableButton(item) {
    return `
        <button
            type="button"
            class="btn btn-outline-primary btn-create-subdomain col-md-auto"

            data-domain="${item.domain}"
            data-subdomain="${item.subdomain}">
                Pilih Subdomain
        </button>
    `;
}

// Function to create unavailable subdomain HTML
function createUnavailableSubdomainHtml(item) {
    return `<h5 class="col-md-auto text-decoration-line-through mb-2"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
}

// Function to create available subdomain HTML
function createAvailableSubdomainHtml(item) {
    return `<h5 class="col-md-auto mb-2"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
}

// // Function to toggle the search result container
function toggleSearchResultContainer() {
    const searchResultContainer = document.getElementById(
        "subdomainsSearcehResultContainer"
    );
    searchResultContainer.hidden = !searchResultContainer.hidden;
}
