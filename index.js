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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
