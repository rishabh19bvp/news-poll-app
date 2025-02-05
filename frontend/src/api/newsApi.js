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
    try {
        // First, check if the poll already exists in MongoDB
        const response = await axios.get(`${API_BASE_URL}/poll/${newsId}`);
        
        if (response.data) {
            console.log("Poll exists in DB:", response.data);
            return response.data; // ✅ Return existing poll
        }
    } catch (error) {
        console.log("No existing poll found, generating a new one...");
    }

    // If poll does not exist, generate a new one using OpenAI
    try {
        const newPollResponse = await axios.post(`${API_BASE_URL}/poll/generate/${newsId}`);
        return newPollResponse.data; // ✅ Return new poll
    } catch (error) {
        console.error("Error fetching poll:", error);
        return null;
    }
};