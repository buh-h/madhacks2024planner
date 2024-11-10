const axios = require('axios');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// mode is not used rn, change travel mode based on it laster
const getRoute = async (origin, destination, mode, startTime) => {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`;

  const requestBody = {
    origin: {
      address: origin
    },
    destination: {
      address: origin
    },
    travelMode: mode,
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
    },
    departureTime: startTime,
    languageCode: "en-US",
    units: "IMPERIAL"
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
};


