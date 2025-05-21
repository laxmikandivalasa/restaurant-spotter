const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;

const app = express();
app.use(cors());
app.use(express.static("public"));

let restaurantData = [];

async function loadData() {
  try {
    const data = await fs.readFile("data/restaurants.json", "utf8");
    restaurantData = JSON.parse(data);
    console.log(`Loaded ${restaurantData.length} restaurants`);
    if (!restaurantData.length) {
      console.warn("Restaurant data is empty.");
    }
  } catch (error) {
    console.error("Error loading restaurant data:", error);
    restaurantData = [];
  }
}
loadData();

// Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// API - all restaurants with pagination
app.get("/api/restaurants", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  if (!restaurantData.length) {
    return res.status(500).json({ error: "No restaurant data available" });
  }

  const paginatedRestaurants = restaurantData.slice(start, end);
  const totalPages = Math.ceil(restaurantData.length / perPage);

  res.json({
    restaurants: paginatedRestaurants,
    totalPages,
    currentPage: page
  });
});

// API - search by name
app.get("/api/search", (req, res) => {
  const name = req.query.name?.toLowerCase();
  if (!name) return res.status(400).json({ error: "Name is required" });

  const results = restaurantData.filter((r) =>
    r.Name?.toLowerCase().includes(name)
  );
  res.json(results);
});

// API - search by location
app.get("/api/location", (req, res) => {
  const { lat, lng, maxDistance = 10 } = req.query;
  if (!lat || !lng)
    return res.status(400).json({ error: "Latitude and longitude are required" });

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: "Invalid latitude or longitude" });
  }

  const results = restaurantData
    .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number')
    .map((restaurant) => {
      const distance = getDistance(
        userLat,
        userLng,
        restaurant.latitude,
        restaurant.longitude
      );
      return { ...restaurant, distance };
    })
    .filter((restaurant) => restaurant.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  res.json(results);
});

// API - search by cuisine
app.get("/api/cuisine", (req, res) => {
  const cuisine = req.query.cuisine?.toLowerCase();
  if (!cuisine) return res.status(400).json({ error: "Cuisine is required" });

  const results = restaurantData.filter((r) => {
    if (!r.cuisines || !Array.isArray(r.cuisines)) {
      return false; // Skip restaurants with invalid cuisines
    }
    return r.cuisines.some(c => c.toLowerCase().includes(cuisine));
  });
  res.json(results);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));