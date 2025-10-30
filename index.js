const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { body, query, validationResult } = require("express-validator");

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
// validation middleware (to allow only valid data for lead creation)
const validateLead = [
  body("name")
    .notEmpty()
    .isString()
    .withMessage("Name is required.")
    .isLength({ min: 2 }),
  body("salesAgent")
    .optional()
    .isMongoId()
    .withMessage("Sales Agent must be a valid Object Id."),
  body("status")
    .isIn(["New", "Contacted", "Qualified", "Proposal Sent", "Closed"])
    .withMessage("Invalid Status Value"),
  body("priority")
    .optional()
    .isIn(["High", "Medium", "Low"])
    .withMessage("Priority must be High, Medium, or Low."),
  body("timeToClose")
    .optional()
    .isNumeric()
    .withMessage("Time to Close must be a number."),
];

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

app.post("/leads", validateLead, async (req, res) => {
  // data validation before creating lead
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erros: errors.array() });
  }

  try {
    const newLead = await createNewLead(req.body);

    let agentData = null;
    if (newLead.salesAgent) {
      if (!mongoose.Types.ObjectId.isValid(newLead.salesAgent)) {
        return res.status(400).json({
          error: "Invalid input: 'salesAgent' must be a valid ObjectId.",
        });
      }

      agentData = await AnvayaSalesAgent.findById(newLead.salesAgent).lean();
      if (!agentData) {
        return res.status(404).json({
          error: `Sales agent with ID ${newLead.salesAgent} not found.`,
        });
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

// 2. SALES AGENT API
// validation middleware (to validate Sales Agent data before agent creation)
const validateAgent = [
  body("name")
    .notEmpty()
    .isString()
    .withMessage("Name is required")
    .isLength({ min: 2 }),
  body("email").notEmpty().isEmail().withMessage("Invalid email format."),
];

// a. Create a New Sales Agent
const createSalesAgent = async (newAgent) => {
  try {
    const agent = new AnvayaSalesAgent(newAgent);
    const saveAgent = await agent.save();
    return saveAgent;
  } catch (error) {
    throw new Error(error.message);
  }
};

app.post("/agents", validateAgent, async (req, res) => {
  // data validation (before creating agent)
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  try {
    const newAgent = await createSalesAgent(req.body);
    if (newAgent) {
      res.status(201).json({ message: "✅ Sales Agent added successfully." });
    } else {
      res.status(400).json({ message: "❗️ Invalid agent details." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error Adding Sales Agent.", error: error.message });
  }
});

// Export app for serverless platforms like Vercel - to start the server
module.exports = app;

// Start server only for local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
}
