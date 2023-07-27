import express from 'express';
import cors from 'cors';
const app = express();

// import routes
import articleRouter from './routes/articleRoute';

const corsOptions = {
    origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));
// routes
app.use('/api/v1/articles', articleRouter);
app.get('/', (req, res) => {
    res
        .status(200)
        .send('Hello from the Reading Advantage server! ');
});

export default app;
