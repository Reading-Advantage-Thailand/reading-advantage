const express = require('express');
const dotenv = require('dotenv');
const app = express();

// Set the path to the config.env file
dotenv.config({ path: './config.env' });

// Routes
app.get('/', (req, res) => {
    res.status(200).send('Hello from the Reading Advantage server! ');
});

// app.use('/api/v1/articles', articleRouter);

module.exports = app;

