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
let AIConversations = {};

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

router.post('/chat/AI', async (req,res) => {
  try{
    const { chatId, email, question } = req.body;
    console.log("req.body:", req.body)
    console.log('Extracted values:');
    console.log('chatId:', chatId);
    console.log('question:', question);

    if(!conversations[chatId] || conversations[chatId].length === 0) {
      return res.json({ message: 'No conversation found to analyse.'});
    }
    
    const messages = conversations[chatId];

    const conversationText = messages
    .map(msg => `${msg.email}: ${msg.message} 
      (send at ${new Date(msg.timestamp).toLocaleString()})`)
      .join('\n')

    const prompt = `You are an AI assistant helping ${email} analyze their chat conversation.

    Conversation:
    ${conversationText}

    User's question: ${question}

    Instructions:
    - Answer based ONLY on the conversation above
    - If they ask about promises/commitments, look for "I will", "I'll", "I promise", etc.
    - If they ask for summaries, provide main topics and key points
    - If they ask about specific people or messages, reference the exact content
    - Be helpful and specific in your responses
    - If you can't find the answer in the conversation, say so clearly

    Answer the user's question:`;
    
    const result = await generativeModel.generateContent(prompt);

    // Extract text response
    const response = result.response.candidates[0].content.parts[0].text;
    
    res.json({ response });

  } catch (error) {
    console.error("Error with AI assistant:", error);
    res.status(500).json({ error: "Failed to return AI request" })
  }
})

module.exports = router;