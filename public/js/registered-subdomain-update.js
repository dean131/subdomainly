const confirmUpdateButton = document.querySelector("#confirmUpdateButton");
confirmUpdateButton.addEventListener("click", async () => {
    const form = document.getElementById("updateSubdomainForm");
    const formData = new FormData(form);

    console.log(formData);

    try {
        const response = await fetchUpdateSubdomain(formData);
        const data = await response.json();

        console.log(data);

        if (data.success) {
            alert("Subdomain updated successfully.");
            toggleUpdateSubdomainModal();
            fetchSubdomainList();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

async function fetchUpdateSubdomain(formData) {
    return fetch(`${SERVER_URL}/api/subdomain/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

function toggleUpdateSubdomainModal() {
    const updateSubdomainModalElement = document.getElementById(
        "updateSubdomainModal"
    );
    const updateSubdomainModal =
        bootstrap.Modal.getInstance(updateSubdomainModalElement) ||
        new bootstrap.Modal(updateSubdomainModalElement);
    updateSubdomainModal.toggle();
}

function resetUpdateSubdomainForm() {
    document.getElementById("updateSubdomainForm").reset();
}

function setUpdateModalTitleAndInputs(name, domain) {
    document.getElementById(
        "updateSubdomainModalLabel"
    ).innerHTML = `${name}.${domain}`;
    document.getElementById("nameUpdateInput").value = name;
    document.getElementById("domainUpdateInput").value = domain;
    document.getElementById("prevSubdomainUpdateInput").value =
        name.split(".")[0];
}

// event binding for update buttons
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("subdomain-update-button")) {
        resetUpdateSubdomainForm();
        setUpdateModalTitleAndInputs(
            e.target.dataset.name,
            e.target.dataset.domain
        );
        toggleUpdateSubdomainModal();
    }
});
