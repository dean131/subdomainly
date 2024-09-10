function makeAlert(message, type = "info") {
    const alertContainer = document.getElementById("alertContainer");
    const icon =
        type === "success"
            ? "fa-check-circle"
            : type === "danger"
            ? "fa-exclamation-circle"
            : "fa-info-circle";
    alertContainer.innerHTML = /*html*/ `
        <div class="alert alert-${type} alert-dismissible fade show custom-alert" role="alert">
            <i class="fas ${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
