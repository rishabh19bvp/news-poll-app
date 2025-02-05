require('dotenv').config();
console.log("MongoDB URI:", process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

const newsRoutes = require('./routes/newsRoutes');
app.use('/api/news', newsRoutes);

const pollRoutes = require('./routes/pollRoutes');
app.use('/api/poll', pollRoutes);

app.get('/', (req, res) => {
    res.send("News Poll API is running...");
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
