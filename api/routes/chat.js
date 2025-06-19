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

// Route to add messages to history
router.post('/chat', async (req, res) => {
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

// Route to fecth messages
router.get('/chat/:chatId', async (req,res) => {
  try {
    const { chatId } = req.params;
    // Return empty array if conversation doesnt exist
    const messages = conversations[chatId] || [];
    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.post('/chat/summary', async (req,res) => {
  console.log("summarizing...")
  try{
    const { chatId } = req.body;

    if(!conversations[chatId]) {
      return res.json({ summary: 'No conversation to summarize yet.' });
    }
    
    const messages = conversations[chatId];

    const conversationText = messages.map(msg => `${msg.email}: ${msg.message}`).join('\n')

    const prompt = `
    Analyze this conversation between two users and provide a summary of what they've discussed:
    
    ${conversationText}
    
    Please summarize:
    1. Main topics discussed
    2. Key decisions or agreements
    3. Any action items or next steps
    4. Overall tone/mood of the conversation
    `;
    
    const result = await generativeModel.generateContent(prompt);

    // Extract text response
    const summary = result.response.candidates[0].content.parts[0].text;
    
    res.json({ summary });

  } catch (error) {
    console.error("Error summarizing messages:", error);
    res.status(500).json({ error: "Failed to summarize messages" })
  }
})

module.exports = router;