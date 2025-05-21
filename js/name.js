document.getElementById("searchForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("nameInput").value.trim();
    if (!name) return;
  
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Loading...</p>";
  
    try {
      const response = await fetch(`/api/search?name=${encodeURIComponent(name)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const restaurants = await response.json();
      console.log("API response:", restaurants); // Debug
      resultsDiv.innerHTML = "";
  
      if (restaurants.length === 0) {
        resultsDiv.innerHTML = "<p>No restaurants found.</p>";
        return;
      }
  
      const ul = document.createElement("ul");
      restaurants.forEach((r) => {
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
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      resultsDiv.innerHTML = "<p>Error fetching results. Please try again later.</p>";
    }
  });