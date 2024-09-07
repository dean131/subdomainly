// Global variable to store the Turnstile token
let TURNSTILE_TOKEN = "";
let MODAL_TOGLE = false;

// Function to initialize Turnstile when the window loads
window.onloadTurnstileCallback = function () {
    turnstile.render("#example-container", {
        sitekey: "1x00000000000000000000AA",
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
    const subdomain = document.getElementById("subdomain-input").value;

    // Clear the previous search error message
    const searchError = document.getElementById("searchError");
    searchError.innerHTML = "";

    // Clear the previous search results
    const resultList = document.getElementById("result-list");
    resultList.innerHTML = "";

    // Check if the subdomain input is empty
    if (!subdomain) {
        searchError.innerHTML = "<p>Please enter a subdomain to search.</p>";
        return;
    }

    try {
        const response = await fetchSubdomainData(subdomain);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            displaySubdomainResults(data.data, resultList);
        } else {
            resultList.innerHTML = "<p>Subdomain tidak tersedia.</p>";
        }
    } catch (error) {
        resultList.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Function to make the API call to search for subdomains
async function fetchSubdomainData(subdomain) {
    return await fetch(`${serverUrl}/api/subdomain/search`, {
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

function createSubdomainListItem(item) {
    const listItem = document.createElement("a");
    listItem.className = "list-group-item list-group-item-action";

    let buttonHtml;
    let subdomainHtml;

    if (item.status === "taken") {
        buttonHtml = /*html*/ `
            <button 
                type="button" 
                class="btn btn-outline-danger" 
                disabled>
                    Tidak Tersedia
            </button>
        `;
        subdomainHtml = /*html*/ `<h5 class="text-decoration-line-through mb-0"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
    } else {
        buttonHtml = /*html*/ `
            <button 
                type="button" 
                class="btn btn-outline-primary btn-create" 
                data-bs-toggle="modal" 
                data-bs-target="#modalCreate"
                data-domain="${item.domain}"
                data-subdomain="${item.subdomain}">
                    Pilih Subdomain
            </button>
        `;
        subdomainHtml = /*html*/ `<h5 class="mb-0"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
    }

    listItem.innerHTML = /*html*/ `
        <div class="d-flex w-100 align-items-center justify-content-between">
            ${subdomainHtml}
            ${buttonHtml}
        </div>
    `;
    return listItem;
}

// Function to display the search results in the UI
function displaySubdomainResults(data, resultList) {
    data.forEach((item) => {
        const listItem = createSubdomainListItem(item);
        resultList.appendChild(listItem);
    });

    showSearchResultContainer();
    addShowModalEventToButtonCreates();
}

function showSearchResultContainer() {
    document.getElementById("subdomainsContainer").hidden = false;
}

// Function to add event listener to the btn-create buttons
function addShowModalEventToButtonCreates() {
    const buttons = document.querySelectorAll(".btn-create");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            document.getElementById("createSubdomainForm").reset(); // Reset form

            // Set the modal title and input values
            const title = `${this.dataset.subdomain}.${this.dataset.domain}`;
            document.getElementById("modalCreateLabel").innerHTML = title;

            // set value to hidden form input
            document.getElementById("subdomainInput").value =
                this.dataset.subdomain;
            document.getElementById("domainInput").value = this.dataset.domain;
        });
    });
}

// Add Event listenenr to form
const createSubdomainForm = document.getElementById("createSubdomainForm");
createSubdomainForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Mencegah form melakukan submit default

    const formData = new FormData(this);

    const data = await fetchCreateSubdomain(formData);
    const response = await data.json();

    if (response.success && response.data.securityCode) {
        hideCreateModal();
        showSecurityCodeModal(response.data.securityCode);
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

    // Set the security code in the input field
    securityCodeInput.value = securityCode;

    // Set up the copy button functionality
    copyButton.addEventListener("click", function () {
        securityCodeInput.select();
        document.execCommand("copy");
        copyButton.textContent = "Copied!";
        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 2000);
    });

    // Show the modal
    securityCodeModal.show();
}

function hideCreateModal() {
    const createModal = bootstrap.Modal.getInstance(
        document.getElementById("modalCreate")
    );
    createModal.hide();
}
