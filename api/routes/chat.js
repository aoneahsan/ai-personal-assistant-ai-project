const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');

const router = express.Router();

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.PROJECT_ID,
  location: 'us-central1', 
  keyFilename: '../config/serviceAccount.json'
});

// Initialize the model
const model = 'gemini-1.5-flash';
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Build conversation context
    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const result = await generativeModel.generateContent({
      contents: contents
    });

    const response = result.response.candidates[0].content.parts[0].text;

    res.json({ response });
  } catch (error) {
    console.error('Vertex AI error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;