const express = require('express');
const router = express.Router();

//controllers
const articleController = require('../controllers/articleController');

//routes
router
    .route('/')
    .get(articleController.getArticle);

router
    .route('/test')
    .get(articleController.test);

module.exports = router;