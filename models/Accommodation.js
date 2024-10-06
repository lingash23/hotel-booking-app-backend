const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema({
  accommodationType: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  pricePerBed: { type: Number },
  details: { type: String },
  imageUrl: { type: String },
});

module.exports = mongoose.model("Accommodation", accommodationSchema);
