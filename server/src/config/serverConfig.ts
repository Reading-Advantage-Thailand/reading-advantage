import dotenv from 'dotenv';
dotenv.config();

export default {
    baseUrl: `${process.env.BASE_URL}${process.env.PORT}/api/${process.env.API_VERSION}` || 'http://localhost:8000/api/v1',
    port: process.env.PORT || 8000,
    apiVersion: process.env.API_VERSION || 'v1',
    nodeENV: process.env.NODE_ENV || 'development',
};