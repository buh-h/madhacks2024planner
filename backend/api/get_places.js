const axios = require('axios');
const { response } = require('express');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

async function getRestaurants(encoded, overriddenOrigin, overriddenDestination, radius) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://places.googleapis.com/v1/places:searchText`;

    //console.log("encoded ", encoded);
    const data = {
        textQuery: "restaurant",
        searchAlongRouteParameters: {
          polyline: {
            encodedPolyline: encoded
          }
        },
        routingParameters: {
          origin: {
            latitude: overriddenOrigin.lat,
            longitude: overriddenOrigin.lng
          }
        }
      };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
            }
        });
        //console.log(response.data.displayName);
        return response.data;
    } catch (error) {
        console.error('Error fetching places:', error.response ? error.response.data : error.message);
        throw error;
    }

    // try {
    //     axios.post(url, {
    //         text: "restaurants",
    //         locationBias: {
    //             encodedPolyline: encodedPolyline,
    //             origin: overriddenOrigin,
    //             destination: overriddenDestination
    //         }
    //     }, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${apiKey}`
    //         }
    //     })

    //     return response.data
    // } catch (error) {
    //     console.error('Error fetching places:', error.response ? error.response.data : error.message);
    //     throw error;
    // }

}
module.exports = { getRestaurants };
