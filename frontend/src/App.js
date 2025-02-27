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
      const response = await axios.post('/search', { query });
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            Found {result.length} relevant answers:
          </Typography>
          {result.map((item, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="body1" paragraph>
                  {item.text}
                </Typography>
                <Link
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="button"
                  display="block"
                  sx={{ mt: 2 }}
                >
                  Watch Video at {Math.floor(item.start_time / 60)}:{(item.start_time % 60).toString().padStart(2, '0')}
                </Link>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default App;
