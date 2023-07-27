import express from 'express';

const router = express.Router();

// controllers
import articleController from '../controllers/articleController';

router
    .route('/level/:level/type/:type')
    .get(articleController.getGenreByTypeAndLevel);

router
    .route('/level/:level/type/:type/genre/:genre')
    .get(articleController.getSubgenreByGenreAndTypeAndLevel);

router
    .route('/level/:level/type/:type/genre/:genre/subgenre/:subgenre')
    .get(articleController.getArticleByGenreAndSubGenreAndTypeAndLevel);

export default router;