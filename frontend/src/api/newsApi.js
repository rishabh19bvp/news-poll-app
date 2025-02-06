import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// ✅ Fetch news from MongoDB
export const fetchNews = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/news/fetch-news`);
        return response.data;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};

// ✅ Check if a poll exists before generating a new one
export const fetchPollForNews = async (newsId) => {
    if (!newsId) {
        console.error("❌ Error: Missing newsId in fetchPollForNews.");
        return null;
    }

    try {
        console.log(`🔍 Checking if poll exists for newsId: ${newsId}`);
        const response = await axios.get(`${API_BASE_URL}/poll/results/${newsId}`);

        if (response.data && response.data.poll) {
            console.log("✅ Poll exists in database:", response.data.poll);
            return response.data.poll;
        }
    } catch (error) {
        console.warn("⚠️ Poll not found, attempting to generate a new one...");
    }

    // ✅ If poll doesn't exist, generate a new one
    try {
        console.log(`🛠️ Generating new poll for newsId: ${newsId}`);
        const newPollResponse = await axios.post(`${API_BASE_URL}/poll/generate/${newsId}`);
        return newPollResponse.data.poll;
    } catch (error) {
        console.error("❌ Error generating poll:", error.response?.data || error.message);
        return null;
    }
};