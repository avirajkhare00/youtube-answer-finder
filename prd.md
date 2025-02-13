### **Product Requirements Document (PRD) for MVP**
**Product Name**:  
**YT Answer Finder (MVP)**  

---

### **1. MVP Objective**  
Build a minimal web app that:  
- Accepts a user’s question.  
- Searches pre-loaded YouTube video transcripts using OpenAI embeddings and Pinecone DB.  
- Returns the most relevant YouTube video link with a timestamp where the answer is found.  

---

### **2. Scope**  
**In Scope**  
- Use **manually uploaded YouTube transcripts** (no automated YouTube API integration).  
- Basic UI for inputting questions and displaying results.  
- OpenAI Ada embeddings + Pinecone DB for semantic search.  

**Out of Scope**  
- User accounts, history, or saved results.  
- Automated YouTube video scraping/transcript fetching.  
- Multi-language support.  

---

### **3. Core Features**  
#### **User Interface (Frontend)**  
1. **Simple Search Bar**:  
   - Users input questions (e.g., “How to fix a leaking pipe?”).  
2. **Result Display**:  
   - Show the YouTube video title, link, and timestamp (e.g., `Video Link&t=120s`).  

#### **Backend**  
1. **Pre-Processed Data Pipeline**:  
   - Manually upload 5–10 YouTube video transcripts (with timestamps).  
   - Use OpenAI Ada to generate embeddings for each transcript segment.  
   - Store embeddings + timestamps in Pinecone DB.  
2. **Query Processing**:  
   - Convert user’s question to an embedding.  
   - Search Pinecone for the closest matching transcript segment.  
   - Return the video ID, timestamp, and transcript snippet.  

---

### **4. Simplified Technology Stack**  
| Component       | Technology                          |  
|-----------------|-------------------------------------|  
| **Frontend**    | React.js (static app)               |  
| **Backend**     | Express.js (Node.js)                |  
| **Vector DB**   | Pinecone DB (free tier)             |  
| **Embeddings**  | OpenAI API (Ada-002 model)          |  
| **Hosting**     | Vercel (frontend) + Render (backend)|  

---

### **5. MVP User Flow**  
1. **Admin Setup**:  
   - Manually upload YouTube video transcripts (CSV/JSON format).  
   - Pre-process transcripts into chunks (e.g., 30-second segments with timestamps).  
   - Generate embeddings for each chunk and store in Pinecone.  

2. **End-User Flow**:  
   - User enters a question.  
   → Backend converts query to an embedding.  
   → Pinecone finds the closest transcript chunk.  
   → App returns: **Video Title**, **URL with Timestamp**, and **Transcript Snippet**.  

---

### **6. MVP Requirements**  
#### **Data Pipeline**  
1. **Transcript Format**:  
   ```json
   {
     "video_id": "abc123",
     "text": "To fix a leak, first turn off the water...",
     "start_time": 120 // seconds
   }
   ```  
2. **Embeddings Generation**:  
   - Use OpenAI’s `text-embedding-ada-002` to convert text chunks to vectors.  
3. **Pinecone Setup**:  
   - Create an index with `dimension=1536` (Ada-002 output).  
   - Store metadata: `video_id`, `start_time`, `text`.  

#### **Backend API**  
1. Single endpoint: `POST /search`  
   - Request: `{ "query": "How to fix a leak?" }`  
   - Response:  
     ```json
     {
       "video_id": "abc123",
       "video_url": "https://youtu.be/abc123?t=120",
       "text": "To fix a leak, first turn off the water...",
       "start_time": 120
     }
     ```

#### **Frontend**  
1. Single-page app with:  
   - Input field for questions.  
   - Display area for results (video link + transcript snippet).  

---

### **7. MVP Milestones (2-3 Weeks)**  
| Week | Tasks                                                                 |  
|------|-----------------------------------------------------------------------|  
| 1    | - Set up Pinecone DB and OpenAI integration.                         |  
|      | - Pre-process 5 YouTube transcripts into chunks + store embeddings.  |  
| 2    | - Build backend API for semantic search.                             |  
|      | - Build basic React frontend.                                        |  
| 3    | - Test end-to-end flow.                                              |  
|      | - Deploy to Vercel + Render.                                         |  

---

### **8. Risks & Mitigation**  
| Risk                          | Mitigation                                   |  
|-------------------------------|----------------------------------------------|  
| Low accuracy in timestamping  | Test with small, focused transcripts (e.g., tutorials). |  
| Pinecone latency              | Use Pinecone’s `pod` free tier for testing.  |  
| OpenAI API costs              | Limit embeddings to MVP-scale data.         |  

---

### **9. Success Criteria**  
- MVP delivers a working app that answers questions with timestamps for pre-loaded videos.  
- Average response time < 3 seconds.  
- Accuracy: 70%+ of test queries return correct timestamps.  

---

### **10. Future Iterations**  
1. Add automated YouTube transcript fetching.  
2. Support more videos and real-time indexing.  
3. Add a video player preview.  

---

This MVP focuses on validating the core concept with minimal effort. Let me know if you need help with code snippets or setup! 🛠️