let currentPage = 1;
const perPage = 9;

async function fetchRestaurants(page) {
  const resultsDiv = document.getElementById("results");
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch(`/api/restaurants?page=${page}&perPage=${perPage}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API response:", data);
    resultsDiv.innerHTML = "";

    if (!data.restaurants || data.restaurants.length === 0) {
      resultsDiv.innerHTML = "<p>No restaurants found.</p>";
      prevButton.disabled = true;
      nextButton.disabled = true;
      pageInfo.textContent = "Page 0 of 0";
      return;
    }

    const ul = document.createElement("ul");
    data.restaurants.forEach((r) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
        ${
            r.featured_image
              ? `<img src="${r.featured_image}" alt="${r.Name}">`
              : ""
          }
          <h3>${r.Name}</h3>
          <p>Cuisines: ${r.cuisines?.join(", ") || "Unknown"}</p>
          <p>Address: ${r.address}, ${r.city}</p>
          <p class="rating">Rating: ${r.rating || "N/A"} (${r.votes || 0} votes, ${r.rating_text || "Not rated"})</p>
          <p>Cost for two: ${r.currency || ""} ${r.average_cost || "N/A"}</p>
          
        </div>
      `;
      ul.appendChild(li);
    });
    resultsDiv.appendChild(ul);

    prevButton.disabled = data.currentPage === 1;
    nextButton.disabled = data.currentPage >= data.totalPages;
    pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    resultsDiv.innerHTML = "<p class='error'>Error fetching results. Please try again later.</p>";
  }
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchRestaurants(currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  currentPage++;
  fetchRestaurants(currentPage);
});

fetchRestaurants(currentPage);