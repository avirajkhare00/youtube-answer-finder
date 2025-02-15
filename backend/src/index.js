require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const app = express();
const path = require('path');
const port = process.env.PORT || 3001;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get Pinecone index
const index = pc.Index(process.env.PINECONE_INDEX_NAME);

// Middleware
app.use(cors());
app.use(express.json());

// Search endpoint
app.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const vector = embedding.data[0].embedding;
    
    // Search Pinecone
    const queryResponse = await index.query({
      vector: vector,
      topK: 3,
      includeValues: true,
      includeMetadata: true
    });

    if (queryResponse.matches.length === 0) {
      return res.status(404).json({ message: "No relevant results found" });
    }

    const results = queryResponse.matches.map(match => {
      const { video_id, start_time, text } = match.metadata;
      return {
        video_id,
        video_url: `https://youtu.be/${video_id}?t=${start_time}`,
        text,
        start_time
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
