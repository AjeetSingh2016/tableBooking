require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('./models/Booking');

const app = express();

// Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// API: Get Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings", error });
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Hello World');
});

// API: Create Booking
app.post('/api/bookings', async (req, res) => {
  const { date, time, guests, name, contact } = req.body;

  if (!date || !time || !guests || !name || !contact) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Check for existing booking in the same slot
    const existingBooking = await Booking.findOne({ date, time });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: "Slot already booked." });
    }

    const newBooking = new Booking({ date, time, guests, name, contact });
    await newBooking.save();
    res.json({ success: true, booking: newBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create booking", error });
  }
});

// API: Delete Booking
app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Booking.findByIdAndDelete(id);
    if (result) {
      res.json({ success: true, message: "Booking deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Booking not found." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete booking", error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
