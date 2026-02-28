'use client';
import { Box, Typography, Container, Paper } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Zen Media Crafter
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Your AI-powered layout generation engine is ready.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1">
            Click the gear icon in the bottom right to configure your API keys,
            and watch the Redux DevTools to see the state update in real-time.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
