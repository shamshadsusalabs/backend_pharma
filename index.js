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


const VERIFY_TOKEN = 'mySecretToken123';
const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0/553427024511427/messages';
const ACCESS_TOKEN = 'EAAYnF4PjkZA8BO1P5sZBkaTu6YaAa3LVw8KzyR0CcfceD8k7oPYNvC2N8HaGr0lGbRq2XVucnOHjY6l5aVltKBNwIQGYSD7JzspRM5IgdZBOHtZBDkBjiyVOaFZBRNjTwhPty003PspFhTDEF0ZABRaxYtiEmZCQuF67IruTD2ZB9AR6XhGRPVfRHTR7ZClCdGcBypvrQni4D1fWh1cKnWdHrz7OQCujz0mf9zmgZD';
 // Replace with your Cloud API access token

app.use(express.json()); // Middleware to parse JSON request bodies

// Webhook verification (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully.");
        res.status(200).send(challenge);
    } else {
        console.log("Webhook verification failed.");
        res.sendStatus(403);
    }
});

// Handle incoming webhook (POST) and send a message
app.post('/webhook', async (req, res) => {
    console.log("Webhook POST request received");
    const data = req.body;

    // Validate the incoming data
    if (!data || !data.messaging_product || !data.to || !data.text || !data.text.body) {
        console.error("Invalid data received");
        return res.sendStatus(400); // Bad request
    }

    const recipient = data.to; // Recipient's WhatsApp number
    const messageBody = data.text.body; // Message body

    console.log(`Preparing to send WhatsApp message to ${recipient}`);
    try {
        // Send a WhatsApp message using Cloud API
        await sendWhatsAppMessage(recipient, messageBody);
        console.log("Message sent successfully!");
        res.sendStatus(200); // Acknowledge webhook
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
        res.sendStatus(500); // Internal Server Error
    }
});

// Function to send WhatsApp message via Cloud API
async function sendWhatsAppMessage(to, message) {
    const payload = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
    };

    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    };

    return axios.post(WHATSAPP_API_URL, payload, { headers });
}


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
