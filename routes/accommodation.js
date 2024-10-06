const express = require("express");
const Accommodation = require("../models/Accommodation");
const router = express.Router();

// Fetch accommodations with optional filtering
router.get("/", async (req, res) => {
  const { searchQuery, accommodationType } = req.query;

  let filters = {};
  if (searchQuery) {
    filters = { name: { $regex: searchQuery, $options: "i" } };
  }
  if (accommodationType) {
    filters.accommodationType = accommodationType;
  }

  try {
    const accommodations = await Accommodation.find(filters);
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
