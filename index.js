const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./db/db.connect");

const app = express();

// CORS setup
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(express.json());
app.use(cors(corsOptions));

// Initialize Database
initializeDatabase()
  .then(console.log("✅ Connected to the database."))
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error.message);
  });

// Export app for serverless platforms like Vercel - to start the server
module.exports = app;

// Start server only for local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
}
