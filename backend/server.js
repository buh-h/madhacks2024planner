require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api_routes');

const app = express();
const PORT = 4000;

app.use(cors());
app.use('/api', apiRoutes);
app.use(express.json());


app.listen(PORT, () => {
    console.log("Backend running on port 4000");
});
