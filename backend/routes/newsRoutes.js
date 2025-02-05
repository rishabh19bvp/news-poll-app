const express = require('express');
const { fetchNews } = require('../controllers/newsController');

const router = express.Router();

// Fetch news and store unique ones
router.get('/fetch-news', fetchNews);

module.exports = router;