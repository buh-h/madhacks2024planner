const axios = require('axios');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

async function getRestaurants(encodedPolyline, overriddenOrigin, overriddenDestination, radius) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

    const params = {
        query: "restaurants",
        locationbias: `path:${encodedPolyline}`,
        radius: radius,
        key: apiKey
    };

    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching places:', error.response ? error.response.data : error.message);
        throw error;
    }
}


module.exports = { getRestaurants };
