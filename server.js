// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
const MONGO_URI = 'mongodb+srv://surajvamshi77:77Surajvamshi%40@adt.aaogy.mongodb.net/?retryWrites=true&w=majority&appName=ADT';
mongoose.connect(MONGO_URI, {});

const runSchema = new mongoose.Schema({
  language: String,
  code: String,
  input: String,
  output: String,
  date: { type: Date, default: Date.now },
});

const Run = mongoose.model('Run', runSchema);

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to execute code
app.post('/run', async (req, res) => {
  const { language, code, input } = req.body;

  const clientId = '9ec8e0a8a970b90b9cceccf2981095ea';
  const clientSecret = 'e91616e8773555d7566b8a3df026c6318285beefb0a031b20b860d74a26180a8';

  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      script: code,
      language: language,
      versionIndex: '0',
      stdin: input,
      clientId,
      clientSecret,
    });

    const output = response.data.output;

    if (!output) {
      return res.status(400).json({ error: 'No output received from JDoodle.' });
    }

    // Save to MongoDB
    const run = new Run({ language, code, input, output });
    await run.save();

    res.json({ output });
  } catch (error) {
    console.error('Error executing code:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
