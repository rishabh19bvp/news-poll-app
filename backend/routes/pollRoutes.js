const express = require("express");
const mongoose = require("mongoose");
const Poll = require("../models/Poll");
const News = require("../models/News");
const axios = require("axios");

const router = express.Router();

/**
 * ✅ GET request to fetch a poll (if exists)
 * - Checks MongoDB for an existing poll
 * - If found, returns the poll
 * - If user is logged in, checks their previous vote
 */
router.get("/results/:newsId", async (req, res) => {
  try {
    const { newsId } = req.params;
    const userId = req.query.userId;

    console.log(`🔍 Checking for poll in MongoDB: News ID ${newsId}`);

    if (!mongoose.Types.ObjectId.isValid(newsId)) {
      return res.status(400).json({ message: "Invalid News ID format" });
    }

    let poll = await Poll.findOne({ newsId });

    if (!poll) {
      console.log(`⚠️ Poll not found for newsId: ${newsId}`);
      return res.status(404).json({ message: "Poll not found" });
    }

    // ✅ Check if user has already voted
    let userVote = null;
    if (userId) {
      const userVoteEntry = poll.votes.find((vote) => vote.userId === userId);
      userVote = userVoteEntry ? userVoteEntry.choice : null;
    }

    res.json({ poll, userVote });
  } catch (error) {
    console.error("❌ Error fetching poll:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ POST request to generate a new poll (ONLY when needed)
 * - Calls Azure OpenAI API for a yes/no poll question
 * - Saves the new poll to MongoDB
 */
router.post("/generate/:newsId", async (req, res) => {
    try {
      const { newsId } = req.params;
  
      console.log(`⚠️ No existing poll found. Generating new poll for newsId: ${newsId}`);
  
      if (!mongoose.Types.ObjectId.isValid(newsId)) {
        console.error("❌ Invalid News ID format");
        return res.status(400).json({ message: "Invalid News ID format" });
      }
  
      // ✅ Fetch news article from MongoDB
      const newsArticle = await News.findById(newsId);
      if (!newsArticle) {
        console.error("❌ News article not found for ID:", newsId);
        return res.status(404).json({ message: "News article not found" });
      }
  
      // ✅ Construct message with news details
      const articleContent = `Title: ${newsArticle.title}\nDescription: ${newsArticle.description}`;
  
      // ✅ Call Azure OpenAI API with full news details
      const openAIResponse = await axios.post(
        `${process.env.AZURE_OPENAI_API_BASE}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { role: "system", content: "You generate yes/no poll questions for news articles." },
            { role: "user", content: `Generate a yes/no poll question based on this news: ${articleContent}` }
          ],
          max_tokens: 50,  // ✅ Ensure valid token count
          temperature: 0.7, // ✅ Ensure variability
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.AZURE_OPENAI_API_KEY,
          },
        }
      );
  
      // ✅ Extract poll question
      const question = openAIResponse.data.choices[0].message.content.trim();
    
  
      // ✅ Save poll to MongoDB
      const poll = await Poll.create({
        newsId: new mongoose.Types.ObjectId(newsId),
        question,
        options: { Yes: 0, No: 0 },
        votes: [],
      });
  
      console.log(`✅ New poll created: ${question}`);
  
      res.json({ poll });
    } catch (error) {
      console.error("❌ Error generating poll:", error);
      res.status(500).json({ error: error.message });
    }
  });
/**
 * ✅ POST request to submit a vote
 * - Ensures user hasn’t voted before
 * - Updates poll results in MongoDB
 */
router.post("/vote", async (req, res) => {
  try {
    const { pollId, option, userId } = req.body;

    if (!pollId || !option || !userId) {
      return res
        .status(400)
        .json({ message: "Missing pollId, option, or userId" });
    }

    if (!["Yes", "No"].includes(option)) {
      return res.status(400).json({ message: "Invalid vote option" });
    }

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid poll ID format" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // ✅ Check if user has already voted
    const existingVote = poll.votes.find((vote) => vote.userId === userId);
    if (existingVote) {
      return res.status(400).json({ message: "User has already voted" });
    }

    // ✅ Update poll votes
    poll.votes.push({ userId, choice: option });
    poll.options[option] += 1;
    await poll.save();

    console.log(
      `✅ Vote recorded: ${userId} voted ${option} on poll ${pollId}`
    );
    res.json({ message: "Vote submitted successfully", poll });
  } catch (error) {
    console.error("❌ Error submitting vote:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
