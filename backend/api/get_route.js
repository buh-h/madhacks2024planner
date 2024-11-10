const axios = require('axios');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const getRoute = async (origin, destination, mode, startTime) => {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`;


  const requestBody = {
    origin: { address: origin },
    destination: { address: destination },
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

  // const requestBody = {
  //   origin: { address: "New York, NY" },
  //   destination: { address: "Los Angeles, CA" },
  //   travelMode: "DRIVE",
  //   routingPreference: "TRAFFIC_AWARE",
  //   polylineQuality: 'OVERVIEW',
  //   computeAlternativeRoutes: false,
  //   routeModifiers: {
  //     avoidTolls: false,
  //     avoidHighways: false,
  //     avoidFerries: false
  //   },
  //   departureTime: "2024-11-11T08:00:00Z",
  //   languageCode: "en-US",
  //   units: "IMPERIAL"
  // };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
        'User-Agent': 'axios/1.7.7',
        'Accept-Encoding': 'gzip, compress, deflate, br'
      }
    });
    //console.log("Request Data:", requestBody);
    //console.log("Response Data:", response.data.routes[0]);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Status:", error.response.status);
      console.error("Error Headers:", error.response.headers);
    } else {
      console.error("Error Message:", error.message);
    }
    throw error; // Re-throw the error to handle it in the calling function if needed
  }
};

module.exports = { getRoute };

