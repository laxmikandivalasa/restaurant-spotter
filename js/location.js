document.addEventListener("DOMContentLoaded", () => {
    // Submit handler
    document.getElementById("locationForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const lat = document.getElementById("latInput").value;
      const lng = document.getElementById("lngInput").value;
      if (!lat || !lng) return;
  
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "<p>Loading...</p>";
  
      try {
        const response = await fetch(`/api/location?lat=${lat}&lng=${lng}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const restaurants = await response.json();
        console.log("API response:", restaurants); // Debug
        resultsDiv.innerHTML = "";
  
        if (restaurants.length === 0) {
          resultsDiv.innerHTML = "<p>No restaurants found within range.</p>";
          return;
        }
  
        const ul = document.createElement("ul");
        restaurants.forEach((r) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <div>
              <h3>${r.Name}</h3>
              <p>Cuisines: ${r.cuisines?.join(", ") || "Unknown"}</p>
              <p>Address: ${r.address}, ${r.city}</p>
              <p class="rating">Rating: ${r.rating || "N/A"} (${r.votes || 0} votes, ${r.rating_text || "Not rated"})</p>
              <p>Cost for two: ${r.currency || ""} ${r.average_cost || "N/A"}</p>
              <p>Distance: ${r.distance.toFixed(2)} km</p>
              ${
                r.featured_image
                  ? `<img src="${r.featured_image}" alt="${r.Name}" style="max-width: 100px;">`
                  : ""
              }
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
  
    // Geolocation button handler
    document.getElementById("useLocationBtn").addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Position retrieved:", position);
          document.getElementById("latInput").value = position.coords.latitude;
          document.getElementById("lngInput").value = position.coords.longitude;
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location.");
        }
      );
    });
  });
  