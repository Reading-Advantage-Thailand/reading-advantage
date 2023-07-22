const express = require('express');
const dotenv = require('dotenv');
const app = express();

app.use(express.json());


// Set the path to the config.env file
dotenv.config({ path: './config.env' });

// Routes
app.use('/api/v1/articles', require('./routes/articleRoute'));
app.get('/', (req, res) => {
    res.status(200).send('Hello from the Reading Advantage server! ');
});


module.exports = app;

