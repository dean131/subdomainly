function generatePaginationHTML(currentPage, totalPages, maxVisiblePages = 5) {
    let paginationHTML = "";

    // Previous button
    if (currentPage > 1) {
        paginationHTML += createPageItem(currentPage - 1, "Previous");
    }

    // Always show the first page
    paginationHTML += createPageItem(1, "1", currentPage === 1);

    // Show ellipsis if currentPage is beyond the visible range
    if (currentPage > maxVisiblePages) {
        paginationHTML += createEllipsis();
    }

    // Calculate start and end pages based on max visible pages
    const { startPage, endPage } = calculatePageRange(
        currentPage,
        totalPages,
        maxVisiblePages
    );

    // Generate page numbers between startPage and endPage
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += createPageItem(i, i.toString(), i === currentPage);
    }

    // Show ellipsis before the last page if not included in the range
    if (endPage < totalPages - 1) {
        paginationHTML += createEllipsis();
    }

    // Always show the last page if it's not already visible
    if (totalPages > 1) {
        paginationHTML += createPageItem(
            totalPages,
            totalPages.toString(),
            currentPage === totalPages
        );
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += createPageItem(currentPage + 1, "Next");
    }

    return paginationHTML;
}

function createPageItem(page, text, isActive = false) {
    return `
        <li class="page-item ${isActive ? "active" : ""}">
            <a class="page-link" href="#" onclick="fetchSubdomainList(${page})">${text}</a>
        </li>
    `;
}

function createEllipsis() {
    return `<li class="page-item disabled"><span class="page-link">...</span></li>`;
}

function calculatePageRange(currentPage, totalPages, maxVisiblePages) {
    const halfMax = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(2, currentPage - halfMax); // Start from 2 to skip the first page (already shown)
    let endPage = Math.min(totalPages - 1, currentPage + halfMax); // Stop before the last page

    // Adjust start and end pages if close to the beginning or end
    if (currentPage <= halfMax + 1) {
        endPage = Math.min(totalPages - 1, maxVisiblePages);
    }
    if (currentPage + halfMax >= totalPages - 1) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 1);
    }

    return { startPage, endPage };
}

async function fetchSubdomainList(page = 1) {
    try {
        const response = await fetch(
            `${serverUrl}/api/subdomain/list?page=${page}`
        );
        const data = await response.json();

        if (data.success) {
            renderSubdomainList(data.data);
            renderPaginationControls(data.pagination);
        } else {
            console.error("Failed to load subdomains:", data.message);
        }
    } catch (error) {
        console.error("Error fetching subdomain list:", error);
    }
}

function renderSubdomainList(subdomainList) {
    const container = document.getElementById("registeredSubdomainContainer");
    container.innerHTML = "";

    if (subdomainList.length === 0) {
        container.innerHTML = makeAlert("Belum ada subdomain yang terdaftar.");
    } else {
        container.innerHTML = subdomainList.map(createSubdomainCard).join("");
        addShowModalEventToButtonDeletes();
    }
}

function createSubdomainCard(item) {
    return /*html*/ `
        <div class="col-12 col-md-6 mb-3">
            <div class="card">
                <div class="card-body">
                    <div class="input-group mb-1">
                        <input type="text" class="form-control font-monospace fw-semibold" value="${item.name}" readonly>
                        <button class="btn btn-outline-primary rounded" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fa-solid fa-caret-down"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a href="http://${item.name}" class="dropdown-item" target="_blank">
                                    <i class="fa-regular fa-eye"></i>
                                    Kunjungi
                                </a>    
                            </li>
                            <li>
                                <a class="dropdown-item" data-subdomain="${item.name}" href="#">
                                    <i class="fa-regular fa-pen-to-square"></i>
                                    Ubah
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item text-danger btn-delete-subdomain" 
                                    href="#"
                                    data-subdomain="${item.name}"
                                >
                                    <i class="fa-regular fa-trash-can"></i>
                                    Hapus
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item text-danger" href="#">
                                    <i class="fa-solid fa-circle-exclamation"></i>
                                    Laporkan
                                </a>
                            </li>
                        </ul>
                    </div>
                    <p class="card-text text-body-secondary fw-light">
                        <strong>Domain:</strong> ${item.domain}
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderPaginationControls(pagination) {
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = generatePaginationHTML(
        pagination.currentPage,
        pagination.totalPages
    );
}

// Function to add event listener to the btn-delete buttons
function addShowModalEventToButtonDeletes() {
    const buttons = document.querySelectorAll(".btn-delete-subdomain");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            resetDeleteSubdomainForm();
            setDeleteModalTitleAndInputs(this.dataset.subdomain);
            toggleDeleteSubdomainModal();
        });
    });
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

// Function to make the API call to delete a subdomain
async function fetchDeleteSubdomain(formData) {
    return fetch(`${serverUrl}/api/subdomain/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
}

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

// Function to hide the delete subdomain modal
// function hideDeleteModal() {
//     const deleteModal = bootstrap.Modal.getInstance(
//         document.getElementById("modalDelete")
//     );
//     deleteModal.hide();
// }

document.addEventListener("DOMContentLoaded", () => {
    fetchSubdomainList();
});
