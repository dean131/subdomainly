function makeAlert(message, type = "info") {
    const alertContainer = document.getElementById("alertContainer");

    const icon =
        type === "success"
            ? "fa-check-circle"
            : type === "danger"
            ? "fa-exclamation-triangle"
            : type === "warning"
            ? "fa-exclamation-circle"
            : type === "primary"
            ? "fa-info-circle"
            : "fa-info-circle";

    const alertClass =
        type === "success"
            ? "alert-success"
            : type === "danger"
            ? "alert-danger"
            : type === "warning"
            ? "alert-warning"
            : type === "primary"
            ? "alert-primary"
            : "alert-info";

    alertContainer.innerHTML = `
        <div class="alert ${alertClass} custom-alert alert-dismissible fade show" role="alert">
            <i class="fas ${icon} alert-icon"></i>
            <span>${message}</span>
            <button type="button" class="custom-close-btn" aria-label="Close">&times;</button>
        </div>
    `;

    // Add event listener to custom close button
    document
        .querySelector(".custom-close-btn")
        .addEventListener("click", () => {
            const alert = document.querySelector(".custom-alert");
            if (alert) {
                alert.classList.remove("show");
                setTimeout(() => alert.remove(), 500);
            }
        });

    // Optional: Automatically hide the alert after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector(".custom-alert");
        if (alert) {
            alert.classList.remove("show");
            setTimeout(() => alert.remove(), 500);
        }
    }, 5000);
}
