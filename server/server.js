const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Helper Functions ---

// 1. Generate YYYYMMDDHHmmss timestamp
const getTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// 2. Generate Middleware to Fetch OAuth Access Token from Safaricom
const generateToken = async (req, res, next) => {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;
  
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.error('Failed to generate token:', error.response ? error.response.data : error.message);
    res.status(400).json({ error: 'Failed to authenticate with Safaricom Daraja API' });
  }
};

// --- Routes ---

// Healthcheck Route
app.get('/', (req, res) => {
  res.send('M-Pesa Express Backend Server Running');
});

// STK Push Route
app.post('/stkpush', generateToken, async (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone number and amount are required' });
  }

  // Format phone number to 2547XXXXXXXX or 2541XXXXXXXX
  let formattedPhone = phone.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = `254${formattedPhone.substring(1)}`;
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  }

  const timestamp = getTimestamp();
  const shortCode = process.env.BUSINESS_SHORT_CODE || '174379';
  const passkey = process.env.PASSKEY;

  // Generate Base64 Password: Shortcode + Passkey + Timestamp
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.CALLBACK_URL || 'https://mydomain.com/callback',
    AccountReference: 'MUT House Hunter',
    TransactionDesc: 'Rental Booking Deposit',
  };

  try {
    const response = await axios.post(stkPushUrl, payload, {
      headers: {
        Authorization: `Bearer ${req.token}`,
      },
    });

    res.status(200).json({
      message: 'STK Push Sent Successfully',
      data: response.data,
    });
  } catch (error) {
    console.error('STK Push Error:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to initiate STK Push',
      details: error.response ? error.response.data : error.message,
    });
  }
});

// Callback Route for Safaricom Payment Confirmation
app.post('/callback', (req, res) => {
  console.log('M-Pesa Payment Callback Received:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
 
