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
                toggleDeleteSubdomainModal();
                // Optionally, refresh the subdomain list or perform other UI updates
                fetchSubdomainList();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
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
function toggleDeleteSubdomainModal() {
    const deleteSubdomainModalElement = document.getElementById(
        "modalDeleteSubdomain"
    );
    // create bootstrap modal instance if not already created, otherwise show it
    const deleteSubdomainModal =
        bootstrap.Modal.getInstance(deleteSubdomainModalElement) ||
        new bootstrap.Modal(deleteSubdomainModalElement);
    deleteSubdomainModal.toggle();
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
        resetDeleteSubdomainForm();
        setDeleteModalTitleAndInputs(e.target.dataset.name);
        toggleDeleteSubdomainModal();
    }
});
