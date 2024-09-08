function showAlert(message) {
    const alert = document.getElementById("searchError");
    alert.innerHTML = /*html*/ `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

function hideAlert() {
    const alert = document.getElementById("searchError");
    alert.innerHTML = "";
}

// cuyyyy
