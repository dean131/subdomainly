// Add event listener to the create subdomain form
document
    .getElementById("createSubdomainForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetchCreateSubdomain(formData);
        const data = await response.json();

        if (data.success && data.data.securityCode) {
            toggleCreateSubdomainModal();
            showSecurityCodeModal(data.data.securityCode);
            // Optionally, refresh the subdomain list or perform other UI updates
            fetchSubdomainList();
        } else {
            alert("Failed to create subdomain.");
        }
    });

// Function to make the API call to create a subdomain
async function fetchCreateSubdomain(formData) {
    return fetch(`${SERVER_URL}/api/subdomain/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

// Function to toggle the create subdomain modal
function toggleCreateSubdomainModal() {
    resetCreateSubdomainForm();
    const createSubdomainModalElement = document.getElementById("modalCreate");
    // If instance is already created, use it; otherwise, create a new one
    const createSubdomainModal =
        bootstrap.Modal.getInstance(createSubdomainModalElement) ||
        new bootstrap.Modal(createSubdomainModalElement);
    createSubdomainModal.toggle();
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

// Function to show the security code modal and fill it with the code
function showSecurityCodeModal(securityCode) {
    const securityCodeModalElement =
        document.getElementById("securityCodeModal");
    const securityCodeModal = new bootstrap.Modal(securityCodeModalElement);
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

// Function to give event to create buttons
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-create-subdomain")) {
        toggleCreateSubdomainModal();
        setCreateModalTitleAndInputs(
            this.dataset.subdomain,
            this.dataset.domain
        );
    }
});
