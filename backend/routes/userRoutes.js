const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");

router.get("/votes/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const userVotes = await Poll.find({ "votes.userId": userId });

        if (!userVotes.length) {
            return res.status(200).json([]);
        }

        // ✅ Format response with poll questions & user choices
        const formattedVotes = userVotes.map(poll => {
            const userVote = poll.votes.find(vote => vote.userId === userId);
            return {
                pollId: poll._id,
                question: poll.question,
                choice: userVote ? userVote.choice : "Unknown",
            };
        });

        res.json(formattedVotes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;