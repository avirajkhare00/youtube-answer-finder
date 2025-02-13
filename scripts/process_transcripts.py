import os
import json
import re
from typing import List, Dict
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Initialize OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize Pinecone
try:
    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    
    index_name = os.getenv('PINECONE_INDEX_NAME')
    # Create index if it doesn't exist
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=1536,  # dimensionality of ada-002
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region=os.getenv('PINECONE_ENVIRONMENT')
            )
        )
    
    index = pc.Index(index_name)
except Exception as e:
    print(f"Error initializing Pinecone: {e}")
    raise

def chunk_transcript(transcript: List[Dict], chunk_size: int = 30) -> List[Dict]:
    """
    Split transcript into chunks of approximately chunk_size seconds
    """
    chunks = []
    current_chunk = []
    chunk_start_time = None
    
    for segment in transcript:
        if not current_chunk:
            chunk_start_time = segment['start_time']
            
        current_chunk.append(segment['text'])
        
        if segment['start_time'] - chunk_start_time >= chunk_size:
            chunks.append({
                'text': ' '.join(current_chunk),
                'start_time': chunk_start_time,
                'video_id': segment['video_id']
            })
            current_chunk = []
            
    # Add remaining segments if any
    if current_chunk:
        chunks.append({
            'text': ' '.join(current_chunk),
            'start_time': chunk_start_time,
            'video_id': transcript[-1]['video_id']
        })
    
    return chunks

def get_embedding(text: str) -> List[float]:
    """
    Get embedding for text using OpenAI's API
    """
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

def parse_timestamp(timestamp: str) -> int:
    """Convert HH:MM:SS.mmm timestamp to seconds"""
    pattern = r'(\d{2}):(\d{2}):(\d{2})'
    match = re.match(pattern, timestamp)
    if not match:
        raise ValueError(f"Invalid timestamp format: {timestamp}")
    
    hours, minutes, seconds = map(int, match.groups())
    return hours * 3600 + minutes * 60 + seconds

def parse_transcript_line(line: str) -> Dict:
    """Parse a single line of transcript into timestamp and text"""
    # Split on first space to separate timestamp and text
    parts = line.strip().split(' ', 1)
    if len(parts) != 2:
        return None
    
    timestamp, text = parts
    try:
        seconds = parse_timestamp(timestamp)
        return {
            'start_time': seconds,
            'text': text
        }
    except ValueError:
        return None

def process_transcript_file(file_path: str):
    """
    Process a single transcript file and upload to Pinecone
    """
    # Extract video ID from filename
    video_id = Path(file_path).stem
    
    # Read and parse transcript
    transcript = []
    with open(file_path, 'r') as f:
        for line in f:
            parsed = parse_transcript_line(line)
            if parsed:
                parsed['video_id'] = video_id
                transcript.append(parsed)
    
    if not transcript:
        print(f"No valid transcript entries found in {file_path}")
        return
    
    # Chunk the transcript
    chunks = chunk_transcript(transcript)
    
    # Process chunks and upload to Pinecone
    for i, chunk in enumerate(chunks):
        # Get embedding for chunk
        embedding = get_embedding(chunk['text'])
        
        # Prepare metadata
        metadata = {
            'text': chunk['text'],
            'start_time': chunk['start_time'],
            'video_id': chunk['video_id']
        }
        
        # Upload to Pinecone
        index.upsert(
            vectors=[(f"{chunk['video_id']}_{i}", embedding, metadata)],
            namespace=''
        )
        
        print(f"Processed chunk {i+1}/{len(chunks)} for video {chunk['video_id']}")

def main():
    """
    Process all transcript files in the data directory
    """
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'transcripts')
    
    # Create directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    # Process each transcript file
    for filename in os.listdir(data_dir):
        if filename.endswith('.txt'):
            file_path = os.path.join(data_dir, filename)
            print(f"Processing {filename}...")
            process_transcript_file(file_path)
            print(f"Finished processing {filename}")

if __name__ == '__main__':
    main()
