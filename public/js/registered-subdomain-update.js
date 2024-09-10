// Initiate the update subdomain form submission
document
    .querySelector("#updateSubdomainForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        try {
            const response = await fetchUpdateSubdomain(formData);
            const data = await response.json();
            if (data.success) {
                makeAlert("Subdomain berhasil diperbarui.", "primary");
                toggleUpdateSubdomainModal();
                // Optionally, refresh the subdomain list or perform other UI updates
                fetchSubdomainList();
            } else {
                makeAlert(data.message, "danger");
            }
        } catch (error) {
            makeAlert(`Error: ${error.message}`, "danger");
        }
    });

// Function to make the API call to update a subdomain
async function fetchUpdateSubdomain(formData) {
    return fetch(`${SERVER_URL}/api/subdomain/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

// Function to toggle the update subdomain modal
function toggleUpdateSubdomainModal() {
    resetUpdateSubdomainForm();
    const updateSubdomainModalElement = document.getElementById(
        "updateSubdomainModal"
    );
    const updateSubdomainModal =
        bootstrap.Modal.getInstance(updateSubdomainModalElement) ||
        new bootstrap.Modal(updateSubdomainModalElement);
    updateSubdomainModal.toggle();
}

// Function to set the update modal title and input values
function setUpdateModalTitleAndInputs(name, domain) {
    document.getElementById("updateSubdomainModalLabel").innerHTML = name;
    document.getElementById("prevSubdomainUpdateInput").value = name;
}

// Function to reset the update subdomain form
function resetUpdateSubdomainForm() {
    document.getElementById("updateSubdomainForm").reset();
}

// event binding for update buttons
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("subdomain-update-button")) {
        toggleUpdateSubdomainModal();
        setUpdateModalTitleAndInputs(
            e.target.dataset.name,
            e.target.dataset.domain
        );
    }
});
