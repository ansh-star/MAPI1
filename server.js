require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/index");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "10mb" })); // Set limit to 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Use routes
app.use("/api", routes); // Mounting routes under /api

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(200).json({ success: false, message: "Internal Server Error" });
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
