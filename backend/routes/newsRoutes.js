const express = require('express');
const { fetchNews } = require('../controllers/newsController');
const News = require('../models/News'); // Import the News model

const router = express.Router();

// Fetch and store unique news articles
router.get('/fetch-news', fetchNews);

// ✅ Fetch paginated news (Lazy Loading)
router.get('/news', async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query; // Default: Page 1, 10 articles per page
        page = parseInt(page);
        limit = parseInt(limit);

        const newsArticles = await News.find({})
            .sort({ publishedAt: -1 }) // ✅ Latest news first
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(newsArticles);
    } catch (error) {
        console.error("❌ Error fetching news:", error);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

module.exports = router;