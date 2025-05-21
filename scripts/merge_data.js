const fs = require('fs').promises;
const csv = require('csv-parse/sync');

async function mergeData() {
  let allRestaurants = [];

  // Step 1: Process JSON files
  const jsonFiles = [
    'zomato_data1.json',
    'zomato_data2.json',
    'zomato_data3.json',
    'zomato_data4.json',
    'zomato_data5.json'
  ];

  for (const file of jsonFiles) {
    try {
      const data = await fs.readFile(`data/${file}`, 'utf8');
      const jsonData = JSON.parse(data);
      const restaurants = jsonData[0]?.restaurants || [];
      const mappedRestaurants = restaurants.map(r => {
        const cuisines = r.restaurant.cuisines
          ? r.restaurant.cuisines.split(', ').filter(c => c)
          : [];
        if (!cuisines.length) {
          console.warn(`Warning: No cuisines for ${r.restaurant.name} in ${file}`);
        }
        return {
          id: r.restaurant.id,
          Name: r.restaurant.name,
          latitude: parseFloat(r.restaurant.location.latitude) || 0,
          longitude: parseFloat(r.restaurant.location.longitude) || 0,
          cuisine: cuisines[0] || 'Unknown',
          cuisines: cuisines,
          city: r.restaurant.location.city || 'Unknown',
          address: r.restaurant.location.address || 'Unknown',
          rating: parseFloat(r.restaurant.user_rating.aggregate_rating) || 0,
          votes: parseInt(r.restaurant.user_rating.votes) || 0,
          average_cost: r.restaurant.average_cost_for_two || 0,
          currency: r.restaurant.currency || 'Unknown',
          has_table_booking: r.restaurant.has_table_booking || 0,
          has_online_delivery: r.restaurant.has_online_delivery || 0,
          featured_image: r.restaurant.featured_image || '',
          price_range: r.restaurant.price_range || 1,
          rating_text: r.restaurant.user_rating.rating_text || 'Not rated',
          rating_color: r.restaurant.user_rating.rating_color || 'Gray'
        };
      });
      allRestaurants.push(...mappedRestaurants);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  // Step 2: Process CSV file
  try {
    const csvData = await fs.readFile('data/restaurants.csv', 'utf8');
    const records = csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    const mappedCsvRestaurants = records.map((r, index) => {
      const cuisines = r.cuisines
        ? r.cuisines.split(', ').filter(c => c)
        : [];
      if (!cuisines.length) {
        console.warn(`Warning: No cuisines for ${r.name} in CSV (index: ${index})`);
      }
      return {
        id: r.id || `csv_${index}`,
        Name: r.name || 'Unknown',
        latitude: parseFloat(r.latitude) || 0,
        longitude: parseFloat(r.longitude) || 0,
        cuisine: cuisines[0] || 'Unknown',
        cuisines: cuisines,
        city: r.City || 'Unknown',
        address: r.address || 'Unknown',
        rating: parseFloat(r.rating) || 0,
        votes: parseInt(r.Votes) || 0,
        average_cost: parseInt(r.average_cost) || 0,
        currency: r.Currency?.replace('(P)', '') || 'Unknown',
        has_table_booking: r['Has Table booking'] === 'Yes' ? 1 : 0,
        has_online_delivery: r['Has Online delivery'] === 'Yes' ? 1 : 0,
        featured_image: '',
        price_range: parseInt(r['Price range']) || 1,
        rating_text: r['Rating text'] || 'Not rated',
        rating_color: r['Rating color'] || 'Gray'
      };
    });
    allRestaurants.push(...mappedCsvRestaurants);
  } catch (error) {
    console.error('Error processing CSV:', error);
  }

  // Step 3: Remove duplicates
  const uniqueRestaurants = [];
  const seenIds = new Set();
  const seenKeys = new Set();

  for (const r of allRestaurants) {
    const key = `${r.Name.toLowerCase()}|${r.address.toLowerCase()}|${r.city.toLowerCase()}`;
    if (!seenIds.has(r.id) && !seenKeys.has(key)) {
      seenIds.add(r.id);
      seenKeys.add(key);
      uniqueRestaurants.push(r);
    }
  }

  // Step 4: Validate and filter
  const validRestaurants = uniqueRestaurants.filter(
    r => r.Name && r.Name !== 'Unknown' && !isNaN(r.latitude) && !isNaN(r.longitude)
  );

  // Step 5: Save consolidated data
  await fs.writeFile('data/restaurants.json', JSON.stringify(validRestaurants, null, 2));
  console.log(`Consolidated ${validRestaurants.length} restaurants into restaurants.json`);
}

mergeData().catch(console.error);