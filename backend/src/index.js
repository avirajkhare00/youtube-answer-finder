require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const app = express();
const port = process.env.PORT || 3001;

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
      model: "text-embedding-ada-002",
      input: query,
    });

    const vector = embedding.data[0].embedding;
    
    // Search Pinecone
    const queryResponse = await index.query({
      vector: vector,
      topK: 1,
      includeValues: true,
      includeMetadata: true
    });

    if (queryResponse.matches.length === 0) {
      return res.status(404).json({ message: "No relevant results found" });
    }

    const match = queryResponse.matches[0];
    const { video_id, start_time, text } = match.metadata;

    res.json({
      video_id,
      video_url: `https://youtu.be/${video_id}?t=${start_time}`,
      text,
      start_time
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
