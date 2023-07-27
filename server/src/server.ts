import dotenv from 'dotenv';
import app from './app';
import serverConfig from './config/serverConfig';
dotenv.config();
app.listen(serverConfig.port, () => {
    console.log(`Server running in ${serverConfig.nodeENV} mode`);
    console.log(`Base URL: ${serverConfig.baseUrl}`);
});

