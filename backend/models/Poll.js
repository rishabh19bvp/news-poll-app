const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema({
  newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
  question: String,
  options: {
    Yes: { type: Number, default: 0 },
    No: { type: Number, default: 0 }
  },
  votes: [
    {
      userId: { type: String, required: true },
      choice: { type: String, enum: ["Yes", "No"], required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Poll", PollSchema);