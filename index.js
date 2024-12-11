// Import required modules
const express = require("express");
const cors = require("cors");  // Import CORS
const cookieParser = require("cookie-parser");  // Import cookie-parser
const bodyParser = require("body-parser");  // Import body-parser
const connectDB = require("./dbconnection/dbconnection"); // Import the database connection function

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



// Handle GET request to verify webhook
app.get('/webhook', (req, res) => {
    console.log("Webhook GET request received");
    console.log("Query parameters:", req.query);

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log("Mode:", mode);
    console.log("Token:", token);
    console.log("Challenge:", challenge);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("Tokens matched. Responding with challenge.");
        res.status(200).send(challenge);
    } else {
        console.log("Tokens did not match. Responding with 403.");
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    console.log("Webhook POST request received");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const data = req.body;

    // Check if the request body contains required properties
    if (!data || !data.messaging_product || !data.to || !data.text) {
        console.log("Invalid data received. Responding with 400.");
        return res.sendStatus(400); // Bad Request if data is invalid
    }

    console.log("Valid webhook data received:");
    console.log(`Messaging product: ${data.messaging_product}`);
    console.log(`Recipient: ${data.to}`);
    console.log(`Message body: ${data.text.body}`);

    // Simulate processing the received message
    console.log("Processing the webhook data...");

    // Send 200 status to acknowledge
    res.sendStatus(200);
    console.log("Acknowledged the webhook with 200 status.");
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
