const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.PROJECT_ID,
  location: 'us-central1', 
});

// Initialize the model
const model = 'gemini-2.5-flash-preview-05-20';
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
});

let conversations = {};

router.post('/chat', async (req, res) => {
  console.log('posting...')
  try {
    const { chatId, email, message } = req.body;

    // If chatId doesn't exist yet then create
    if(!conversations[chatId]) {
      conversations[chatId] = [];
    }

    conversations[chatId].push({
      email,
      message,
      timestamp: new Date().toISOString()
    })

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

router.get('/chat/:chatId', async (req,res) => {
  console.log('fetching...')
  const { chatId } = req.params;
  console.log('messages:', conversations[chatId])
  try {

    // Return empty array if conversation doesnt exist
    const messages = conversations[chatId] || [];
    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

module.exports = router;