
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
  const msg = req.body.message;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          role: 'user',
          parts: [{
            text: `ನೀವು ARYA 🌱 ರೈತರ AI ಸಹಾಯಕ. ಯಾವಾಗಲೂ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು.

ಪ್ರಶ್ನೆ: ${msg}`
          }]
        }]
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ reply });

  } catch (e) {
    res.json({ reply: "Arya ಲಭ್ಯವಿಲ್ಲ" });
  }
});

module.exports = router;
