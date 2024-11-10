const axios = require('axios');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const getRoute = async (origin, destination, mode, startTime) => {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`;


  // const requestBody = {
  //   origin: { address: origin },
  //   destination: { address: destination },
  //   travelMode: mode,
  //   routingPreference: "TRAFFIC_AWARE",
  //   computeAlternativeRoutes: false,
  //   routeModifiers: {
  //     avoidTolls: false,
  //     avoidHighways: false,
  //     avoidFerries: false
  //   },
  //   departureTime: startTime,
  //   languageCode: "en-US",
  //   units: "IMPERIAL"
  // };

  const requestBody = {
    origin: { address: "New York, NY" },
    destination: { address: "Los Angeles, CA" },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
    },
    departureTime: "2024-11-10T08:00:00Z",
    languageCode: "en-US",
    units: "IMPERIAL"
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
};

module.exports = { getRoute };

