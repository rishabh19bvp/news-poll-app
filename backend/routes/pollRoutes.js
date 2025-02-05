const express = require('express');
const { generatePollForNews, getPollByNewsId, voteOnPoll } = require('../controllers/pollController');

const router = express.Router();

// ✅ Check if a poll exists before generating a new one
router.get('/:newsId', getPollByNewsId);

// ✅ Generate a poll if it doesn’t exist
router.post('/generate/:newsId', generatePollForNews);

router.post("/vote", voteOnPoll);

module.exports = router;