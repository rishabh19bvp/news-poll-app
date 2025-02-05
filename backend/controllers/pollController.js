const axios = require('axios');
const mongoose = require('mongoose');
const Poll = require('../models/Poll');
const News = require('../models/News');

// ✅ First, check if a poll exists in the database
const getPollByNewsId = async (req, res) => {
    try {
        const { newsId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(newsId)) {
            return res.status(400).json({ message: "Invalid news ID format" });
        }

        const existingPoll = await Poll.findOne({ newsId });
        if (!existingPoll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        res.status(200).json(existingPoll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const voteOnPoll = async (req, res) => {
    try {
        const { pollId, option, userId } = req.body;

        if (!pollId || !option || !userId) {
            return res.status(400).json({ message: "Missing pollId, option, or userId" });
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // ✅ Check if the user has already voted
        const existingVote = poll.votes.find(vote => vote.userId === userId);
        if (existingVote) {
            return res.status(400).json({ message: "User has already voted in this poll" });
        }

        // ✅ Register the new vote
        poll.options[option] += 1;
        poll.votes.push({ userId, choice: option });
        await poll.save();

        res.json({
            poll,
            userVote: option, // ✅ Return user's vote
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ Generate a new poll only if it doesn’t exist
const generatePollForNews = async (req, res) => {
    try {
        const { newsId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(newsId)) {
            return res.status(400).json({ message: "Invalid news ID format" });
        }

        const existingPoll = await Poll.findOne({ newsId });
        if (existingPoll) {
            return res.status(200).json(existingPoll);
        }

        // Get news article for context
        const newsArticle = await News.findById(newsId);
        if (!newsArticle) {
            return res.status(404).json({ message: "News article not found" });
        }

        // Call OpenAI API to generate a poll
        const response = await axios.post(
            `${process.env.AZURE_OPENAI_API_BASE}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
            {
                messages: [
                    { role: "system", content: "You are an AI that generates thought-provoking poll questions based on news articles." },
                    { role: "user", content: `Generate a yes/no poll question for this news article: "${newsArticle.title}"` }
                ],
                max_tokens: 30,
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.AZURE_OPENAI_API_KEY
                }
            }
        );

        const question = response.data.choices[0].message.content.trim();

        const poll = new Poll({
            newsId,
            question,
            options: { "Yes": 0, "No": 0 }
        });

        await poll.save();
        res.status(201).json(poll);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = { generatePollForNews, getPollByNewsId, voteOnPoll };