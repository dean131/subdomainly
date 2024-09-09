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

    // Clear the previous search error message
    const searchError = document.getElementById("searchError");
    searchError.innerHTML = "";

    // Clear the previous search results
    const resultList = document.getElementById("result-list");
    resultList.innerHTML = "";

    // Check if the subdomain input is empty
    if (!subdomain) {
        searchError.innerHTML = /*html*/ `
        <p id="searchErrorMessage" class="invalid-feedback">
            Silakan masukkan subdomain yang ingin dicari.
        </p>
        `;
        return;
    }

    try {
        const response = await fetchSubdomainData(subdomain);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            displaySubdomainSearchResults(data.data, resultList);
        } else if (data.success && data.data.length === 0) {
            searchError.innerHTML = "<p>Subdomain tidak tersedia.</p>";
        } else {
            searchError.innerHTML = `<p>${data.message}</p>`;
        }
    } catch (error) {
        searchError.innerHTML = `<p>Error: ${error.message}</p>`;
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
                class="btn btn-outline-danger col-md-auto"
                disabled>
                    Tidak Tersedia
            </button>
        `;
        subdomainHtml = /*html*/ `<h5 class="col-md-auto text-decoration-line-through mb-1"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
    } else {
        buttonHtml = /*html*/ `
            <button
                type="button"
                class="btn btn-outline-primary btn-create-subdomain col-md-auto"
                data-bs-toggle="modal"
                data-bs-target="#modalCreate"
                data-domain="${item.domain}"
                data-subdomain="${item.subdomain}">
                    Pilih Subdomain
            </button>
        `;
        subdomainHtml = /*html*/ `<h5 class="col-md-auto mb-1"><strong>${item.subdomain}</strong>.${item.domain}</h5>`;
    }

    listItem.innerHTML = /*html*/ `
        <div class="row align-items-center justify-content-between">
            ${subdomainHtml}
            ${buttonHtml}
        </div>
    `;
    return listItem;
}

// Function to display the search results in the UI
function displaySubdomainSearchResults(data, resultList) {
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

// Function to add event listener to the btn-create-subdomain buttons
function addShowModalEventToButtonCreates() {
    const buttons = document.querySelectorAll(".btn-create-subdomain");
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

// Function to hide the create subdomain modal
function hideCreateModal() {
    const createModal = bootstrap.Modal.getInstance(
        document.getElementById("modalCreate")
    );
    createModal.hide();
}

// Function to handle the search input event
function handleSearchInput(event) {
    event.target.value = event.target.value.toLowerCase().trim();
}

// Function to add event listener to the btn-delete buttons
function addShowModalEventToButtonDeletes() {
    const buttons = document.querySelectorAll(".btn-delete");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            document.getElementById("deleteSubdomainForm").reset(); // Reset form

            // Set the modal title and input values
            const title = `Delete ${this.dataset.subdomain}.${this.dataset.domain}`;
            document.getElementById("modalDeleteLabel").innerHTML = title;

            // set value to hidden form input
            document.getElementById("subdomainToDelete").value =
                this.dataset.subdomain;
            document.getElementById("domainToDelete").value =
                this.dataset.domain;
        });
    });
}

// Function to make the API call to delete a subdomain
async function fetchDeleteSubdomain(formData) {
    return fetch(`${serverUrl}/api/subdomain/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

// Event listener for the confirm delete button
document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", async () => {
        const form = document.getElementById("deleteSubdomainForm");
        const formData = new FormData(form);

        try {
            const response = await fetchDeleteSubdomain(formData);
            const data = await response.json();

            if (data.success) {
                alert("Subdomain deleted successfully.");
                hideDeleteModal();
                // Optionally, refresh the subdomain list or perform other UI updates
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

// Function to hide the delete subdomain modal
function hideDeleteModal() {
    const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("modalDelete")
    );
    deleteModal.hide();
}
