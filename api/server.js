const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Import routes
const chatRoutes = require('./routes/chat');

// Use routes
app.use('/api', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});