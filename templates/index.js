require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/key', (req, res) => {
    res.json({ "key": process.env.GOOGLE_MAPS_API_KEY });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

