const polyline = require('@mapbox/polyline');

const { getRoute } = require('../api/get_route');
const { getRestaurants } = require('../api/get_places');

// To decode polylines in order to parse
const decodePolyline = (encoded) => {
    return polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
};

// Finds the portion of the route that 'fits' within the specified time range
// Returns 2 coordinates that represend the start and end of the time bounds
const partitionRouteInTimeframe = (route, startTime, lowerTimeBound, upperTimeBound) => {
    if (lowerTimeBound >= upperTimeBound) {
        throw new Error("Invalid time bounds: lowerTimeBound should be less than upperTimeBound");
    }

    const encodedPolyline = route.routes[0].polyline.encodedPolyline;
    const points = decodePolyline(encodedPolyline);

    if (!Array.isArray(points) || points.length < 1) {
        throw new Error("Not enough points on polyline or points is not an array");
    }

    const totalDistance = route.routes[0].distanceMeters;
    const totalDuration = parseInt(route.routes[0].duration.replace('s', ''), 10);
    let cumulativeDistance = 0;
    let cumulativeTime = startTime;
    let leftPoint;
    let rightPoint;

    // If the route already started within the lower bound, use the first point
    if (startTime >= lowerTimeBound) {
        leftPoint = points[0];
    }
    // Iterates along all the polyline points ignoring the first
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const prevPoint = points[i - 1];
        const distance = haversineDistance(prevPoint.lat, prevPoint.lng, point.lat, point.lng);
        cumulativeDistance += distance;

        // Calculate the cumulative time based on the distance covered
        cumulativeTime = startTime + (cumulativeDistance / totalDistance) * totalDuration;

        // Check if cumulative time is within the left bound, only assigning a value to it once
        if (!leftPoint && cumulativeTime >= lowerTimeBound) {
            leftPoint = point;
        }

        // Check if cumulative time has reached the upper bound
        if (cumulativeTime >= upperTimeBound) {
            rightPoint = point;
            return { leftPoint, rightPoint };
        }
    }

    // If no right point is found, use the last point
    if (!rightPoint) {
        rightPoint = points[points.length - 1];
    }

    return { leftPoint, rightPoint };
};


// Returns a list of locations that fit within the partitions specifed in the list
const searchLocationsInRoute = async (origin, destination, mode, startTime, mealTimes, radius) => {
    // Gets the route associated with origin, destination, mode of travel, and start time
    const route = await getRoute(origin, destination, mode, startTime);
    // array containing all locations
    let allRestaurantsArray = [];
    for (const time of mealTimes) {
        // structure containing the override origin and destination coordinates 
        const { leftPoint, rightPoint } = partitionRouteInTimeframe(route, startTime, time - 1, time + 1);

        // gets a json of all restaurants that are inside the partitioned route
        const restaurantsNearRoute = await getRestaurants(route.polyline, leftPoint, rightPoint, radius);

        // Adds the restaurants to the array
        allRestaurantsArray.push(...restaurantsNearRoute);
    }

    return allRestaurantsArray;
};

module.exports = { searchLocationsInRoute };