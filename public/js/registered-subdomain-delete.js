// Event listener for the confirm delete button
document
    .getElementById("deleteSubdomainForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        try {
            const response = await fetchDeleteSubdomain(formData);
            const data = await response.json();
            if (data.success) {
                makeAlert("Subdomain berhasil dihapus.", "prymary");
                toggleDeleteSubdomainModal("hide");
                // Optionally, refresh the subdomain list or perform other UI updates
                toggleSearchResultContainer("hide");
                clearPreviousSearchResults();
                fetchSubdomainList();
            } else {
                makeAlert(data.message, "danger");
            }
        } catch (error) {
            makeAlert(`Error: ${error.message}`, "danger");
        }
    });

// Function to make the API call to delete a subdomain
async function fetchDeleteSubdomain(formData) {
    return fetch(`${SERVER_URL}/api/subdomain/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

// Function to toggle the delete subdomain modal
function toggleDeleteSubdomainModal(action = "toggle") {
    resetDeleteSubdomainForm();
    const deleteSubdomainModalElement = document.getElementById(
        "modalDeleteSubdomain"
    );
    // create bootstrap modal instance if not already created, otherwise show it
    const deleteSubdomainModal =
        bootstrap.Modal.getInstance(deleteSubdomainModalElement) ||
        new bootstrap.Modal(deleteSubdomainModalElement);
    if (action === "show") {
        deleteSubdomainModal.show();
    } else if (action === "hide") {
        deleteSubdomainModal.hide();
    } else {
        deleteSubdomainModal.toggle();
    }
}

// Function to reset the delete subdomain form
function resetDeleteSubdomainForm() {
    document.getElementById("deleteSubdomainForm").reset();
}

// Function to set the delete modal title and input values
function setDeleteModalTitleAndInputs(subdomain) {
    document.getElementById(
        "modalDeleteSubdomainLabel"
    ).innerHTML = `Delete ${subdomain}`;
    document.getElementById("subdomainDeleteInput").value = subdomain;
}

// Add event listener to delete subdomain buttons
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("subdomain-delete-button")) {
        toggleDeleteSubdomainModal("show");
        setDeleteModalTitleAndInputs(e.target.dataset.name);
    }
});
