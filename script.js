const options = {
  "Access-Control-Request-Method": "GET",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": "CG-ZmfpJAfXmQhQrQuFL38HNov9",
  },
};

const tableBody = document.querySelector("#crypto-table tbody");
const paginationDiv = document.getElementById("pagination");
const loaderDiv = document.getElementById("loader");
const searchBox = document.getElementById("search-box");
let filteredData = [];
let sort_order = "market_cap_desc";
let currentPage = 1;
const itemsPerPage = 15;
let totalPages = 1;
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let cryptoData = [];
let arrow = "";

document.getElementById("sortOptions").addEventListener("change", () => {
  sort_order = document.getElementById("sortOptions").value;
  initialize();
});

function updateSortArrows(sort_order) {
  const sortElements = ["price", "volume", "market_cap"];

  sortElements.forEach((elementId) => {
    const ascendingArrow = "🠥";
    const descendingArrow = "🠧";

    if (sort_order === `${elementId}_asc`) {
      arrow = document.getElementById(elementId);
      arrow.innerHTML = ascendingArrow;
    } else if (sort_order === `${elementId}_desc`) {
      arrow = document.getElementById(elementId);
      arrow.innerHTML = descendingArrow;
    } else {
      arrow = document.getElementById(elementId);
      arrow.innerHTML = "";
    }
  });
}

async function fetchCryptoData(page) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${sort_order}&per_page=${itemsPerPage}&page=${page}`,
      options
    );
    const data = await response.json();
    if (data.length === 0) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

async function fetchTotalCryptoCount() {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`,
      options
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.length;
  } catch (error) {
    console.error(error.message);
    return 0;
  }
}

function populateTable(data) {
  tableBody.innerHTML = "";
  data.forEach((crypto, index) => {
    const row = document.createElement("tr");
    const isFavourite = favourites.some((fav) => fav.id === crypto.id);
    row.innerHTML = `
            <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
            <td><img src="${crypto.image}" alt="${
      crypto.name
    }" class="crypto-icon"></td>
    <td class="fullTd"><a class="fullTd" href="coin.html?id=${
      crypto.id
    }">${crypto.name.toLocaleString()}</a></td>
            <td>$${crypto.current_price.toLocaleString()}</td>
            <td>${crypto.total_volume.toLocaleString()}</td>
            <td>$${crypto.market_cap.toLocaleString()}</td>
            <td><button class="fav-button ${
              isFavourite ? "active" : ""
            }" data-id="${crypto.id}">★</button></td>
        `;
    tableBody.appendChild(row);
  });
  document.querySelectorAll(".fav-button").forEach((button) => {
    button.addEventListener("click", () => {
      const cryptoId = button.getAttribute("data-id");
      const cryptoDataHere = data.find((crypto) => crypto.id === cryptoId);
      if (favourites.some((fav) => fav.id === cryptoId)) {
        favourites = favourites.filter((fav) => fav.id !== cryptoId);
        button.classList.remove("active");
      } else {
        favourites.push(cryptoDataHere);
        button.classList.add("active");
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
    });
  });
}

function createPagination(totalItems) {
  paginationDiv.innerHTML = "";
  totalPages = Math.ceil(totalItems / itemsPerPage);
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

async function loadPage(page) {
  showLoader();

  const data = await fetchCryptoData(page);
  cryptoData = data;
  filteredData = data;
  hideLoader();
  populateTable(data);
  document.querySelectorAll(".page-number").forEach((button) => {
    button.classList.remove("active");
  });
  document
    .querySelector(`.page-number:nth-child(${page})`)
    .classList.add("active");
}

function showLoader() {
  loaderDiv.style.display = "flex";
}

function hideLoader() {
  loaderDiv.style.display = "none";
}

async function initialize() {
  const totalItems = await fetchTotalCryptoCount();
  if (totalItems > 0) {
    updateSortArrows(sort_order);
    createPagination(totalItems);
    loadPage(currentPage);
  }
}

function searchCrypto() {
  const searchText = searchBox.value.toLowerCase();
  console.log(searchText);
  filteredData = cryptoData.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchText)
  );
  populateTable(filteredData);
}

searchBox && searchBox.addEventListener("input", searchCrypto);

initialize();
