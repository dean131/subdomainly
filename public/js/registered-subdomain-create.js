// Add event listener to the create subdomain form
document
    .getElementById("createSubdomainForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetchCreateSubdomain(formData);
        const data = await response.json();
        if (data.success && data.data.securityCode) {
            toggleCreateSubdomainModal("hide");
            showSecurityCodeModal(data.data.securityCode);
            // Optionally, refresh the subdomain list or perform other UI updates
            clearPreviousSearchResults();
            toggleSearchResultContainer("hide");
            fetchSubdomainList();
            makeAlert("Subdomain berhasil dibuat.", "primary");
        } else {
            makeAlert(data.message, "danger");
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
function toggleCreateSubdomainModal(action = "toggle") {
    resetCreateSubdomainForm();
    const createSubdomainModalElement = document.getElementById(
        "createSubdomainModal"
    );
    const createSubdomainModal =
        bootstrap.Modal.getInstance(createSubdomainModalElement) ||
        new bootstrap.Modal(createSubdomainModalElement);
    if (action === "show") {
        createSubdomainModal.show();
    } else if (action === "hide") {
        createSubdomainModal.hide();
    } else {
        createSubdomainModal.toggle();
    }
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
    // If instance is already created, use it; otherwise, create a new one
    const securityCodeModal =
        bootstrap.Modal.getInstance(securityCodeModalElement) ||
        new bootstrap.Modal(securityCodeModalElement);

    const securityCodeInput = document.getElementById("securityCodeInput");
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

// Function to give event to create buttons
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-create-subdomain")) {
        toggleCreateSubdomainModal("show");
        setCreateModalTitleAndInputs(
            e.target.dataset.subdomain,
            e.target.dataset.domain
        );
    }
});
