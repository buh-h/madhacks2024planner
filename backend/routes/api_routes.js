const express = require('express');
const router = express.Router();
const { searchLocationsInRoute } = require('../controllers/search_route');

router.get('/places/', (req, res) => {
    // Parameters being passed to function
    const origin = req.query.origin.replace(/\+/g, ' ');
    const destination = req.query.destination.replace(/\+/g, ' ');
    const mode = "DRIVE";
    const startTime = new Date(req.query.startTime).toISOString();
    const mealTimes = req.query.mealTimes.split(',').map(time => new Date(time).toISOString());
    const radius = parseInt(req.query.radius, 10);
  
    
    searchLocationsInRoute(origin, destination, mode, startTime, mealTimes, radius)
      .then(result => res.json(result))
      .catch(error => res.status(500).json({ error: error.message }));
});

module.exports = router;