import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Serve static frontend from the public folder
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/chat', async (req, res) => {
  const { message } = req.body as { message?: string };
  if (!message) return res.status(400).json({ error: 'message required' });

  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const resp = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message },
          ],
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = resp.data?.choices?.[0]?.message?.content || 'No reply';
      return res.json({ reply });
    } catch (err) {
      console.error('OpenAI error', err?.response?.data || err);
      return res.status(500).json({ error: 'model error' });
    }
  }

  // Fallback: simple echo when no API key is configured
  return res.json({ reply: `Echo: ${message}` });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
