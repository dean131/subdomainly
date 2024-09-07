// Global variable to store the Turnstile token
let turnstileToken = "";
let modalTogle = false;

// Function to initialize Turnstile when the window loads
window.onloadTurnstileCallback = function () {
    turnstile.render("#example-container", {
        sitekey: "1x00000000000000000000AA",
        callback: onTurnstileSuccess,
    });
};

// Callback function triggered when Turnstile validation is successful
function onTurnstileSuccess(token) {
    turnstileToken = token;
    document.getElementById("btn-search").disabled = false;
}

// Function to fetch subdomain search results from the server
async function searchSubdomain() {
    const subdomain = document.getElementById("subdomain-input").value;
    const resultList = document.getElementById("result-list");
    resultList.innerHTML = "";

    if (!subdomain) {
        resultList.innerHTML = "<p>Please enter a subdomain to search.</p>";
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
            turnstile: turnstileToken,
        }),
    });
}

// Function to create an individual list item for each subdomain
function createSubdomainListItem(item) {
    const listItem = document.createElement("a");
    listItem.href = "#";
    listItem.className = "list-group-item list-group-item-action";
    listItem.innerHTML = /*html*/ `
        <div class="d-flex w-100 align-items-center justify-content-between">
            <h5><strong>${item.subdomain}</strong>.${item.domain}</h5>
            <button 
                type="button" 
                class="btn btn-outline-primary btn-create" 
                data-bs-toggle="modal" 
                data-bs-target="#modalCreate"
                data-domain="${item.domain}"
                data-subdomain="${item.subdomain}">
                    Pilih Subdomain
            </button>
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

    document.getElementById("subdomainsContainer").hidden = false;

    addShowModalEventToButtonCreates();
}

// Function to add event listener to the btn-create buttons
function addShowModalEventToButtonCreates() {
    const buttons = document.querySelectorAll(".btn-create");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            document.getElementById("createSubdomainForm").reset(); // Reset form

            // Set the modal title and input values
            const title = this.dataset.subdomain + "." + this.dataset.domain;
            document.getElementById("modalCreateLabel").innerHTML = title;

            // set value to hidden form input
            document.getElementById("subdomainInput").value =
                this.dataset.subdomain;
            document.getElementById("domainInput").value = this.dataset.domain;
        });
    });
}

// Add Event listenenr to form
const form = document.getElementById("createSubdomainForm");
form.addEventListener("submit", function (e) {
    e.preventDefault(); // Mencegah form melakukan submit default

    const formData = new FormData(this);
    console.log(JSON.stringify(Object.fromEntries(formData)));

    fetch(`${serverUrl}/api/subdomain/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("modalCreate")
            );
            modal.hide();

            // Show the security code modal and fill it with the code
            if (data.data.securityCode) {
                showSecurityCodeModal(data.data.securityCode);
            } else {
                // Handle the case where no security code is provided
                console.error("No security code provided in the response");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});

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
