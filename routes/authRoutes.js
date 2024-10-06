const express = require("express");
const {
  registerUser,
  activateUser,
  authUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/activate/:token", activateUser);
router.post("/login", authUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/:userId", getUserDetails);

module.exports = router;
