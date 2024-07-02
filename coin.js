document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const coinId = params.get("id");

  if (coinId) {
    const coinDetails = await fetchCoinDetails(coinId);
    await updateChart("30", coinId); // Default to 30 days chart

    displayCoinDetails(coinDetails);
  }
});

async function fetchCoinDetails(coinId) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching coin details:", error);
    return null;
  }
}

async function fetchCoinMarketData(coinId, days) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching coin market data:", error);
    return null;
  }
}

function displayCoinDetails(coin) {
  if (!coin) return;

  const coinDetailsElement = document.getElementById("coinDetails");

  coinDetailsElement.innerHTML = `
  <div><img src=${coin.image.large}></div>
    <h1>${coin.name} (${coin.symbol.toUpperCase()})</h1>
    <p>Market Cap: $${coin.market_data.market_cap.usd.toLocaleString()}</p>
    <p>Current Price: $${coin.market_data.current_price.usd.toLocaleString()}</p>
    <p>24h High: $${coin.market_data.high_24h.usd.toLocaleString()}</p>
    <p>24h Low: $${coin.market_data.low_24h.usd.toLocaleString()}</p>
  `;
}

let chart;

async function updateChart(days, coinId) {
  if (!coinId) {
    const params = new URLSearchParams(window.location.search);
    coinId = params.get("id");
  }

  const marketData = await fetchCoinMarketData(coinId, days);
  displayCoinChart(marketData);
}

function displayCoinChart(marketData) {
  if (!marketData) return;

  const ctx = document.getElementById("coinChart").getContext("2d");
  const labels = marketData.prices.map((price) => new Date(price[0]));
  const data = marketData.prices.map((price) => price[1]);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Price (USD)",
          data: data,
          borderColor: "red",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      animations: {
        tension: {
          duration: 1000,
          easing: "linear",
          from: 1,
          to: 0,
          loop: true,
        },
      },
      responsive: true,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "MMM dd",
            displayFormats: {
              day: "MMM dd",
            },
          },
          ticks: {
            source: "auto",
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
