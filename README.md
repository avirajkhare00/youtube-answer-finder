# YT Answer Finder

A web application that helps users find specific answers in YouTube videos using semantic search.

## Features
- Ask questions and get relevant YouTube video timestamps
- Semantic search using OpenAI embeddings
- Pinecone vector database for efficient similarity search

## Tech Stack
- Frontend: React.js
- Backend: Express.js (Node.js)
- Vector Database: Pinecone
- Embeddings: OpenAI API (Ada-002)
- Hosting: Vercel (frontend) + Render (backend)

## Setup Instructions

### Prerequisites
- Node.js >= 14
- Python >= 3.8 (for transcript processing)
- OpenAI API key
- Pinecone API key

### Installation

1. Clone the repository
2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
Create `.env` files in both backend and frontend directories with the necessary API keys.

5. Start the development servers:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## Project Structure
```
.
├── backend/             # Express.js server
├── frontend/           # React.js frontend
├── scripts/            # Data processing scripts
└── data/              # Sample transcripts and processed data
```
