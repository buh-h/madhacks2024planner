const axios = require('axios');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

async function getRestaurants(encodedPolyline, overriddenOrigin, overriddenDestination, radius) {

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants&locationbias=path:${encodedPolyline}&radius=${radius}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const places = response.data.results;

  } catch (error) {
    console.error('Error fetching places:', error);
  }
}

searchRestaurantsAlongRoute(apiKey, encodedPolyline, overriddenOrigin, overriddenDestination, radius);
