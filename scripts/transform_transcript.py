"""
Script to transform transcript files between different formats.
Converts from SRT format to simple timestamp format.
"""

import re
from datetime import datetime
import argparse

def parse_srt_timestamp(timestamp):
    """Convert SRT timestamp to seconds."""
    pattern = r'(\d{2}):(\d{2}):(\d{2}),(\d{3})'
    match = re.match(pattern, timestamp)
    if not match:
        return None
    
    hours, minutes, seconds, milliseconds = map(int, match.groups())
    total_seconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
    return total_seconds

def format_simple_timestamp(seconds):
    """Convert seconds to simple timestamp format (HH:MM:SS.mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds_remainder = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds_remainder:06.3f}"

def transform_transcript(input_file, output_file):
    """Transform transcript from SRT format to simple timestamp format."""
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read().strip()
    
    # Split into subtitle blocks
    blocks = content.split('\n\n')
    transformed_lines = []
    
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue
            
        # Skip the subtitle number
        timestamp_line = lines[1]
        text = ' '.join(lines[2:])
        
        # Extract start timestamp
        start_time = timestamp_line.split(' --> ')[0]
        seconds = parse_srt_timestamp(start_time)
        
        if seconds is not None:
            simple_timestamp = format_simple_timestamp(seconds)
            transformed_lines.append(f"{simple_timestamp} {text}")
    
    # Write transformed content
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(transformed_lines))

def main():
    parser = argparse.ArgumentParser(description='Transform transcript from SRT format to simple timestamp format')
    parser.add_argument('input_file', help='Input transcript file in SRT format')
    parser.add_argument('output_file', help='Output transcript file in simple format')
    
    args = parser.parse_args()
    transform_transcript(args.input_file, args.output_file)

if __name__ == '__main__':
    main()
