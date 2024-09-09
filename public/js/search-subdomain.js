// Global variable to store the Turnstile token
let TURNSTILE_TOKEN = "";
let MODAL_TOGLE = false;

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
                giveEventToButtonCreates();
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

// Function to clear previous search results and errors
function clearPreviousSearchResults() {
    document.getElementById("searchError").innerHTML = "";
    document.getElementById("result-list").innerHTML = "";
}

// Function to display search error messages
function displaySearchError(message) {
    document.getElementById("searchError").innerHTML = `<p>${message}</p>`;
}

// Function to make the API call to search for subdomains
async function fetchSubdomainData(subdomain) {
    return fetch(`${serverUrl}/api/subdomain/search`, {
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
        <div class="row align-items-center justify-content-between">
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
    return `<h5 class="col-md-auto text-decoration-line-through mb-1"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
}

// Function to create available subdomain HTML
function createAvailableSubdomainHtml(item) {
    return `<h5 class="col-md-auto mb-1"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
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

// Function to add event listener to the btn-create-subdomain buttons
function giveEventToButtonCreates() {
    const buttons = document.querySelectorAll(".btn-create-subdomain");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            resetCreateSubdomainForm();
            setCreateModalTitleAndInputs(
                this.dataset.subdomain,
                this.dataset.domain
            );
            toggleCreateSubdomainModal();
        });
    });
}

// Function to reset the create subdomain form
function resetCreateSubdomainForm() {
    document.getElementById("createSubdomainForm").reset();
}

// Function to set the create modal title and input values
function setCreateModalTitleAndInputs(subdomain, domain) {
    document.getElementById(
        "modalCreateLabel"
    ).innerHTML = `${subdomain}.${domain}`;
    document.getElementById("subdomainInput").value = subdomain;
    document.getElementById("domainInput").value = domain;
}

// Add event listener to the create subdomain form
document
    .getElementById("createSubdomainForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetchCreateSubdomain(formData);
        const data = await response.json();

        if (data.success && data.data.securityCode) {
            // hideCreateModal();
            toggleCreateSubdomainModal();
            showSecurityCodeModal(data.data.securityCode);
        } else {
            alert("Failed to create subdomain.");
        }
    });

// Function to make the API call to create a subdomain
async function fetchCreateSubdomain(formData) {
    return fetch(`${serverUrl}/api/subdomain/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

// Function to show the security code modal and fill it with the code
function showSecurityCodeModal(securityCode) {
    const securityCodeModal = new bootstrap.Modal(
        document.getElementById("securityCodeModal")
    );
    const securityCodeInput = document.querySelector("#securityCodeInput");
    const copyButton = document.getElementById("securityCodeCopyButton");

    securityCodeInput.value = securityCode;
    setupCopyButton(copyButton, securityCodeInput);

    securityCodeModal.show();
}

// Function to set up the copy button functionality
function setupCopyButton(copyButton, securityCodeInput) {
    copyButton.addEventListener("click", function () {
        securityCodeInput.select();
        document.execCommand("copy");
        copyButton.textContent = "Copied!";
        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 2000);
    });
}

// // Function to hide the create subdomain modal
// function hideCreateModal() {
//     const createModal = bootstrap.Modal.getInstance(
//         document.getElementById("modalCreate")
//     );
//     createModal.hide();
// }

// Function to toggle the create subdomain modal
function toggleCreateSubdomainModal() {
    const createModalElement = document.getElementById("modalCreate");
    const createModal =
        bootstrap.Modal.getInstance(createModalElement) ||
        new bootstrap.Modal(createModalElement);
    createModal.toggle();
}

// Function to handle the search input event
function handleSearchInput(event) {
    event.target.value = event.target.value.toLowerCase().trim();
}
