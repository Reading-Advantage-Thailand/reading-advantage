const dotenv = require('dotenv');
const app = require('./app');
const port = process.env.PORT || 3000;
dotenv.config({ path: './config.env' });

const server = app.listen(process.env.PORT, () => {
    console.log(`App running on port ${port}...`);
});

