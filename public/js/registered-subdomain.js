function generatePaginationHTML(currentPage, totalPages, maxVisiblePages = 5) {
    let paginationHTML = "";

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="fetchSubdomainList(${
                    currentPage - 1
                })">Previous</a>
            </li>
        `;
    }

    // Always show the first page
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? "active" : ""}">
            <a class="page-link" href="#" onclick="fetchSubdomainList(1)">1</a>
        </li>
    `;

    // Show ellipsis if currentPage is beyond the visible range
    if (currentPage > maxVisiblePages) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    // Calculate start and end pages based on max visible pages
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

    // Generate page numbers between startPage and endPage
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <a class="page-link" href="#" onclick="fetchSubdomainList(${i})">${i}</a>
            </li>
        `;
    }

    // Show ellipsis before the last page if not included in the range
    if (endPage < totalPages - 1) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    // Always show the last page if it's not already visible
    if (totalPages > 1) {
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? "active" : ""}">
                <a class="page-link" href="#" onclick="fetchSubdomainList(${totalPages})">${totalPages}</a>
            </li>
        `;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="fetchSubdomainList(${
                    currentPage + 1
                })">Next</a>
            </li>
        `;
    }

    return paginationHTML;
}

async function fetchSubdomainList(page = 1) {
    try {
        // Fetch data dari API sesuai halaman
        const response = await fetch(
            `${serverUrl}/api/subdomain/list?page=${page}`
        );
        const data = await response.json();

        if (data.success) {
            const subdomainList = data.data;
            const container = document.getElementById(
                "registeredSubdomainContainer"
            );
            const paginationControls =
                document.getElementById("paginationControls");

            // Kosongkan kontainer sebelum menambahkan item baru
            container.innerHTML = "";

            // Build HTML string untuk daftar subdomain
            let subdomainHTML = "";
            subdomainList.forEach((item) => {
                subdomainHTML += `
                    <div class="col-12 col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <a href="http://${item.name}" class="card-text link-underline link-underline-opacity-0">${item.name}</a>
                                <p class="card-text">${item.domain}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Tampilkan daftar subdomain ke container
            container.innerHTML = subdomainHTML;

            // Generate pagination controls
            const pagination = data.pagination;
            paginationControls.innerHTML = generatePaginationHTML(
                pagination.currentPage,
                pagination.totalPages
            );
        } else {
            console.error("Failed to load subdomains:", data.message);
        }
    } catch (error) {
        console.error("Error fetching subdomain list:", error);
    }
}

// Panggil fetchSubdomainList saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    fetchSubdomainList();
});
