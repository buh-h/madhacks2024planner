const polyline = require('@mapbox/polyline');

const { getRoute } = require('../api/get_route');
const { getRestaurants } = require('../api/get_places');

// To decode polylines in order to parse
const decodePolyline = (encoded) => {
    return polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
};

// For calculating the distance between 2 points
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

const partitionRouteInTimeframe = (route, startTime, lowerTimeBound, upperTimeBound) => {
    
    if (lowerTimeBound >= upperTimeBound) {
        console.log (lowerTimeBound, upperTimeBound);
        throw new Error("Invalid time bounds: lowerTimeBound should be less than upperTimeBound");
    }   

    const encodedPolyline = route.routes[0].polyline.encodedPolyline;
    const points = decodePolyline(encodedPolyline);
    //console.log(points);
    if (!Array.isArray(points) || points.length < 1) {
        throw new Error("Not enough points on polyline or points is not an array");
    }

    const totalDistance = route.routes[0].distanceMeters;
    const totalDuration = parseInt(route.routes[0].duration.replace('s', ''), 10);
    //console.log(lowerTimeBound, upperTimeBound);
    let cumulativeDistance = 0;
    let cumulativeTime = startTime;
    let leftPoint = points[0];
    let rightPoint = points[points.length - 1];
    //console.log(leftPoint, rightPoint);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const prevPoint = points[i - 1];
        const distance = haversineDistance(prevPoint.lat, prevPoint.lng, point.lat, point.lng);
        cumulativeDistance += distance;

        cumulativeTime = (cumulativeDistance / totalDistance) * totalDuration;

        if (cumulativeTime >= lowerTimeBound) {
            leftPoint = prevPoint;
        }

        if (cumulativeTime >= upperTimeBound) {
            rightPoint = point;
            break;
        }
    }
    
    return { leftPoint, rightPoint };
};


// Returns a list of locations that fit within the partitions specifed in the list
const searchLocationsInRoute = async (origin, destination, mode, startTime, mealTimes, radius) => {
    // Gets the route associated with origin, destination, mode of travel, and start time
    const route = await getRoute(origin, destination, mode, startTime);

    //console.log(startTime instanceof Date);
    // array containing all locations
    
    // sorts the meal times to get a time for breakfast, lunch, dinner
    mealTimes.sort((a, b) => a[0] * 60 + a[1] - (b[0] * 60 + b[1]));
    // Index of time closest to current time
    let closestIndex = 0;
    let closestTimeDifference = Infinity;
    // The start time in minutes and hours for calculations (ignoring rest of date)
    const startTimeMins = startTime.getHours() * 60 + startTime.getMinutes();
    // Finds the index of the time closest to the start time to start iteration
    for (let i=0; i<mealTimes.length; i++) {
        const [hours, minutes] =  mealTimes[i];
        // Finds the difference in time
        let timeDifference = hours * 60 + minutes - startTimeMins;
        if (timeDifference < 0) {
            timeDifference += 1440;
        }
        if (timeDifference < closestTimeDifference) {
            closestIndex = i;
            closestTimeDifference = timeDifference;
        }
    }
    let allRestaurants = [];
    const mealTimeInSeconds = mealTimes[closestIndex][0] * 3600 + mealTimes[closestIndex][1] * 60;
    const startTimeInSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60 + startTime.getSeconds();
    let elapsedTime = mealTimeInSeconds - startTimeInSeconds;
    // Continues finding partitions as long as the drive continues
    while(elapsedTime <= parseInt(route.routes[0].duration.replace('s', ''), 10)) {
        const [hours, minutes] =  mealTimes[closestIndex];
        const seconds = hours * 3600 + minutes * 60;
        let lowerTimeBound =  new Date(startTime);
        lowerTimeBound.setSeconds(lowerTimeBound.getSeconds() + elapsedTime - 3600);
        let upperTimeBound =  new Date(startTime);
        upperTimeBound.setSeconds(upperTimeBound.getSeconds() + elapsedTime + 3600);
        
        // structure containing the override origin and destination coordinates 
        const { leftPoint, rightPoint } = partitionRouteInTimeframe(route, startTime, lowerTimeBound, upperTimeBound);
        //console.log(route);
        // gets a json of all restaurants that are inside the partitioned route
        const restaurantsNearRoute = await getRestaurants(route.routes[0].polyline.encodedPolyline, leftPoint, rightPoint, radius);
        //console.log("near route: ", restaurantsNearRoute.places[0].displayName);
        // Adds the restaurants to the array

        restaurantsNearRoute.places.forEach(place => {
            //console.log(place);
            allRestaurants.push(place);
        });
        

        elapsedTime += seconds;
        // Increment and loop around back to the start of the array if needed
        closestIndex++;
        closestIndex = closestIndex % mealTimes.length;
    }
    console.log(allRestaurants);
    return allRestaurants;
};

module.exports = { searchLocationsInRoute };