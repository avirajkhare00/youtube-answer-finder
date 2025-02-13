import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Link,
  Box,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/search`, { query });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        YT Answer Finder
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Ask a question"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading || !query.trim()}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Found an answer!
            </Typography>
            <Typography variant="body1" paragraph>
              {result.text}
            </Typography>
            <Link
              href={result.video_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="button"
              display="block"
              sx={{ mt: 2 }}
            >
              Watch Video at {Math.floor(result.start_time / 60)}:{(result.start_time % 60).toString().padStart(2, '0')}
            </Link>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default App;
