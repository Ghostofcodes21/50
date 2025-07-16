const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('✅ Golden Glass AI Backend is running!');
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message || '';
  console.log('📩 Incoming message:', userMessage);

  try {
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: userMessage })
      }
    );

    const text = await hfResponse.text();
    console.log('🔎 HF raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ reply: '⚠️ Hugging Face returned invalid JSON:\n' + text });
    }

    let reply = '🤖 Sorry, no reply.';
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    res.json({ reply });
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ reply: '⚠️ Server error.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Golden Glass AI Backend running on port ${PORT}`));
