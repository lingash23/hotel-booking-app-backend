const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Accommodation = require("../models/Accommodation");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, async (req, res) => {
  const {
    userId,
    accommodationId,
    numberOfMembers,
    checkInDate,
    checkOutDate,
  } = req.body;

  try {
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    const totalPrice = accommodation.pricePerBed * numberOfMembers;

    const booking = new Booking({
      userId,
      accommodationId,
      numberOfMembers,
      totalPrice,
      checkInDate,
      checkOutDate,
    });

    await booking.save();

    const user = await User.findById(userId);

    console.log(user);
    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "no-reply@hotel.com",
        to: user.email,
        subject: "Booking Confirmation",
        text: `
Dear ${user.username},

We are pleased to confirm your booking for ${accommodation.name}.

Location: ${accommodation.location}
Number of Members: ${numberOfMembers}
Check-in Date: ${new Date(checkInDate).toLocaleDateString()}
Check-out Date: ${new Date(checkOutDate).toLocaleDateString()}
Total Price: $${totalPrice}

Thank you for choosing our service! If you have any questions or need further assistance, feel free to contact us.


  `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Email sent: " + info.response);
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Cancel a booking
router.delete("/:bookingId/cancel", authMiddleware, async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking and populate the user and accommodation details
    const booking = await Booking.findById(bookingId)
      .populate("userId")
      .populate("accommodationId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Prepare and send the cancellation email
    if (booking.userId) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "no-reply@hotel.com",
        to: booking.userId.email,
        subject: "Booking Cancellation",
        text: `
Dear ${booking.userId.username},

We regret to inform you that your booking for ${booking.accommodationId?.name} has been canceled.

Location: ${booking.accommodationId?.location}
Number of Members: ${booking.numberOfMembers}
Total Price: $${booking.totalPrice}

We apologize for any inconvenience caused.

  `,
      };

      // Send the email
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res
            .status(500)
            .json({ message: "Failed to send cancellation email" });
        }
        console.log("Email sent:", info.response);

        // Delete the booking after the email is sent
        try {
          await Booking.findByIdAndDelete(bookingId);
          res.json({ message: "Booking canceled successfully" });
        } catch (deleteError) {
          console.error("Error deleting booking:", deleteError);
          res.status(500).json({ message: "Failed to delete booking" });
        }
      });
    } else {
      // If no user, just delete the booking without sending an email
      try {
        await Booking.findByIdAndDelete(bookingId);
        res.json({ message: "Booking canceled successfully" });
      } catch (deleteError) {
        console.error("Error deleting booking:", deleteError);
        res.status(500).json({ message: "Failed to delete booking" });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: error.message });
  }
});

// Fetch bookings by userId
router.get("/user/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await Booking.find({ userId }).populate("accommodationId");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
