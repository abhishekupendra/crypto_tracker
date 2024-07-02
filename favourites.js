const tableBody = document.querySelector("#favourite-crypto-table tbody");

let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
const paginationDiv = document.getElementById("pagination");
const itemsPerPage = 15;
let currentPage = 1;
let totalPages = 1;
let startIndex = 1;
let endIndex = 1;
const searchBox = document.getElementById("search-box");
let filteredFavourites = [...favourites];

function populateTable(data) {
  tableBody.innerHTML = "";

  if (favourites.length === 0) {
    tableBody.innerHTML =
      '<b class="NoFavourite">Favourite coins not available....</b>';
  }

  data.forEach((crypto, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td><img src="${crypto.image}" alt="${
      crypto.name
    }" class="crypto-icon"></td>
    <td>${crypto.name.toLocaleString()}</td>
            <td>$${crypto.current_price.toLocaleString()}</td>
            <td>${crypto.total_volume.toLocaleString()}</td>
            <td>$${crypto.market_cap.toLocaleString()}</td>
            <td><button class="fav-button active" data-id="${
              crypto.id
            }">★</button></td>
        `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".fav-button").forEach((button) => {
    button.addEventListener("click", () => {
      const cryptoId = button.getAttribute("data-id");
      favourites = favourites.filter((fav) => fav.id !== cryptoId);

      filteredFavourites = filteredFavourites.filter(
        (fav) => fav.id !== cryptoId
      );

      localStorage.setItem("favourites", JSON.stringify(favourites));

      loadPage(currentPage);
      createPagination(filteredFavourites.length);
    });
  });
}

function createPagination() {
  paginationDiv.innerHTML = "";
  totalPages = Math.ceil(favourites.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageNumberButton = document.createElement("span");
    pageNumberButton.textContent = i;
    pageNumberButton.className = "page-number";
    if (i === currentPage) {
      pageNumberButton.classList.add("active");
    }
    pageNumberButton.addEventListener("click", () => {
      currentPage = i;
      loadPage(currentPage);
    });
    paginationDiv.appendChild(pageNumberButton);
  }
}

function loadPage(page) {
  startIndex = (page - 1) * itemsPerPage;
  endIndex = startIndex + itemsPerPage;
  const pageData = filteredFavourites.slice(startIndex, endIndex);

  populateTable(pageData);
  document.querySelectorAll(".page-number").forEach((button) => {
    button.classList.remove("active");
  });
  document
    .querySelector(`.page-number:nth-child(${page})`)
    .classList.add("active");
}

function searchCrypto() {
  const searchText = searchBox.value.toLowerCase();
  filteredFavourites = favourites.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchText)
  );
  currentPage = 1;
  createPagination(filteredFavourites.length);
  loadPage(currentPage);
}

searchBox && searchBox.addEventListener("input", searchCrypto);

function initialize() {
  createPagination(filteredFavourites.length);
  loadPage(currentPage);
}
initialize();
