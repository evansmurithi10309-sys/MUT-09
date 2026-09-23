const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Test route
app.get('/', (req, res) => {
  res.send('M-Pesa Backend Server is Running');
});

// STK Push Route Placeholder
app.post('/stkpush', async (req, res) => {
  const { phone, amount } = req.body;
  // Daraja STK Push logic goes here
  res.json({ message: 'STK Push Initiated', phone, amount });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
