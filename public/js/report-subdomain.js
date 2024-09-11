// Initiate report subdomain form
document
    .getElementById("reportSubdomainForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetch(`${SERVER_URL}/api/subdomain/report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        const data = await response.json();
        if (data.success) {
            makeAlert("Report submitted successfully.", "primary");
            toggleReportSubdomainModal("hide");
        } else {
            makeAlert(data.message, "danger");
        }
    });

// Function to set the report modal title and input values
function setReportModalInputs(id, subdomain) {
    document.getElementById("subdomainIdReportInput").value = id;
    document.getElementById("subdomainReportInput").value = subdomain;
}

// Function to toggle the report subdomain modal
function toggleReportSubdomainModal(action = "toggle") {
    const reportSubdomainModalElement = document.getElementById("modalReport");
    const reportSubdomainModal =
        bootstrap.Modal.getInstance(reportSubdomainModalElement) ||
        new bootstrap.Modal(reportSubdomainModalElement);
    if (action === "show") {
        reportSubdomainModal.show();
    } else if (action === "hide") {
        reportSubdomainModal.hide();
    } else {
        reportSubdomainModal.toggle();
    }
}

// Add event listener to report subdomain buttons
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("report-subdomain-button")) {
        toggleReportSubdomainModal("show");
        setReportModalInputs(e.target.dataset.id, e.target.dataset.name);
    }
});
