const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");

router.get("/votes/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // ✅ Validate userId
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        console.log(`🔍 Fetching votes for user: ${userId}`);

        const userVotes = await Poll.find({ "votes.userId": userId });

        if (!userVotes || userVotes.length === 0) {
            return res.status(200).json({ message: "No votes found for this user.", votes: [] });
        }

        // ✅ Format response
        const formattedVotes = userVotes.map(poll => {
            const userVote = poll.votes.find(vote => vote.userId === userId);
            return {
                pollId: poll._id,
                question: poll.question,
                choice: userVote ? userVote.choice : "Unknown",
            };
        });

        res.status(200).json({ message: "User votes retrieved successfully.", votes: formattedVotes });

    } catch (error) {
        console.error("❌ Error fetching user votes:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;