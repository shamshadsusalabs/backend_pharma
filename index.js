// Import required modules
const express = require("express");
const cors = require("cors");  // Import CORS
const cookieParser = require("cookie-parser");  // Import cookie-parser
const bodyParser = require("body-parser");  // Import body-parser
const connectDB = require("./dbconnection/dbconnection"); // Import the database connection function


const axios = require('axios');
// Initialize the express app
const app = express();

// Middleware to enable CORS
app.use(cors({
    origin:[ process.env.CLIENT_URL || "http://localhost:4200","https://susapharma.netlify.app" ],// Change as needed
    methods: "GET, POST, PUT, DELETE",
    credentials: true,  // Enable cookies to be sent along with the requests
}));

// Middleware to parse incoming request bodies
app.use(bodyParser.json());  // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded

// Middleware to parse cookies
app.use(cookieParser());  // To parse cookies

// Connect to the MongoDB database
connectDB();

// Define your routes
const user = require('./Router/User');  // Import the User router
app.use('/api/v1/users', user); 
const store = require('./Router/Store');  // Import the User router
app.use('/api/v1/store', store); 
const stock = require('./Router/Stockalert');  // Import the User router
app.use('/api/v1/stockAlert',  stock );// Use the user router for user-related API endpoints
const expiryAlert = require('./Router/ExpiryAlert');  // Import the User router
app.use('/api/v1/expiryAlert',  expiryAlert );

const storebilling = require('./Router/StoreBilling');  // Import the User router
app.use('/api/v1/storebilling',  storebilling  );

const PurchaseFile = require('./Router/PurchaseFile');  // Import the User router
app.use('/api/v1/PurchaseFile', PurchaseFile  );

const FilebillingSaver = require('./Router/File');  // Import the User router
app.use('/api/v1/File', FilebillingSaver  );


const Discount = require('./Router/Discount');  // Import the User router
app.use('/api/v1/',  Discount  );


const Order = require('./Router/Order');  // Import the User router
app.use('/api/v1/',  Order );
// Example route to check if the server is running
app.get("/", (req, res) => {
    res.send("Hello, world!");
});



const VERIFY_TOKEN = 'mysecreat123';

 // Replace with your Cloud API access token
 const accessToken = 'EAAyVNTDdAiEBOZBn7h1ZAZAyQXK0OJZC5emol6SQSkruNmmnrIsrv0LorcHhQP5jfEG6eZAxMeC08h27pCTgVYM5PAdrccoUK7On9QGlUH5tZBbtrPAEU3nCtytlBhQnZCmsiLuQk1rk6mZAZBbgyBfsSZAo1h6fQN8qjQDm6BEZCpfKVR5yDnnEJZCTAIZApX1WmNuHET0sQd7ZBtBWZBPyHS1VZCotemch0lDeQqSy1bHZC'; // Replace with your Meta API access token
 const phoneNumberId = '+1 555 136 5349';
app.use(express.json()); // Middleware to parse JSON request bodies

// Webhook verification (GET)



// Webhook verification (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const token = req.query['hub.verify_token'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified successfully.');
            res.status(200).send(challenge);
        } else {
            console.log('Webhook verification failed.');
            res.status(403).send('Forbidden');
        }
    } else {
        res.status(400).send('Bad Request');
    }
});

// Handle incoming messages and send WhatsApp messages (POST)
app.post('/webhook', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (phoneNumber && message) {
        try {
            // Send message via WhatsApp API
            const response = await axios.post(
                `https://graph.facebook.com/v15.0/${phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    text: { body: message },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Message sent:', response.data);
            res.status(200).send({
                message: `Message sent to ${phoneNumber}`,
                data: response.data,
            });
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
            res.status(500).send({
                error: 'Failed to send message',
                details: error.response?.data || error.message,
            });
        }
    } else {
        res.status(400).send({
            error: 'Both phone number and message are required in the request body.',
        });
    }
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
