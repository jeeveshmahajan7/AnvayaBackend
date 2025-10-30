const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const { initializeDatabase } = require("./db/db.connect");
const AnvayaLead = require("./models/lead.model");
const AnvayaSalesAgent = require("./models/salesAgent.model");

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
  .then(() => console.log("✅ Connected to the database."))
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error.message);
  });

// endpoints
// base route
app.get("/", async (req, res) => {
  try {
    res.status(200).json({ message: "✅ Anvaya backend is operational." });
  } catch (error) {
    console.log("❌ Anvaya backend deployment unsuccessful.");
  }
});

// 1. LEADS API
// a. Create a New Lead
const createNewLead = async (newLead) => {
  try {
    const lead = new AnvayaLead(newLead);
    const saveLead = await lead.save();
    return saveLead;
  } catch (error) {
    throw new Error(error.message);
  }
};

app.post("/leads", async (req, res) => {
  try {
    const newLead = await createNewLead(req.body);

    let agentData = null;
    if (newLead.salesAgent) {
      if (!mongoose.Types.ObjectId.isValid(newLead.salesAgent)) {
        return res.status(400).json({
          error: "Invalid input: 'salesAgent' must be a valid ObjectId.",
        });
      }

      agentData = await AnvayaSalesAgent.findById(salesAgent).lean();
      if (!agentData) {
        return res
          .status(404)
          .json({ error: `Sales agent with ID ${salesAgent} not found.` });
      }
    }

    if (newLead) {
      res
        .status(201)
        .json({ message: "✅ Successfully created new Lead.", lead: newLead });
    } else {
      res.status(400).json({ message: "❗️Invalid lead data." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating the lead", error: error.message });
  }
});

// b. Get all Leads
// const findAllLeads = async () => {
//   try {
//     const leads = await AnvayaLead.find();
//     return leads;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// app.get("/leads", async (req, res) => {
//   try {
//     const leads = await findAllLeads();
//     if (leads.length > 0) {
//       return res.json({
//         message: "✅ Successfully fetched leads.",
//         leads: leads,
//       });
//     } else {
//       return res.status(400).json({ message: "❗️Invalid input." });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "❌ Error fetching leads.", error: error.message });
//   }
// });

// Export app for serverless platforms like Vercel - to start the server
module.exports = app;

// Start server only for local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
}
