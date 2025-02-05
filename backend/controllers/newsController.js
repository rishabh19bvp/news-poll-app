const axios = require('axios');
const News = require('../models/News');

const fetchNews = async (req, res) => {
    try {
        // Fetch news from NewsAPI
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`);
        const articles = response.data.articles;

        let newArticles = [];

        for (const article of articles) {
            // Check if the news article already exists in the database
            const existingNews = await News.findOne({ title: article.title });

            if (!existingNews) {
                newArticles.push({
                    title: article.title,
                    description: article.description,
                    imageUrl: article.urlToImage,
                    content: article.content,
                    url: article.url
                });
            }
        }

        // Insert only new articles
        if (newArticles.length > 0) {
            await News.insertMany(newArticles);
            console.log(`${newArticles.length} new articles added.`);
        } else {
            console.log("No new articles to add.");
        }

        // Retrieve all stored news from MongoDB
        const allNews = await News.find().sort({ createdAt: -1 });

        // Send stored news back to the frontend
        res.status(200).json(allNews);

    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { fetchNews };