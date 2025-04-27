import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const createBooking = asyncHandler(async (req, res) => {
    console.log(req.params,"  ",req.user);
    
    const { roomId } = req.params;
    const user = req.user._id;

    // Validate room ID
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        res.status(400);
        throw new Error("Invalid room ID format");
    }

    // Check if booking already exists for this user and room
    const existingBooking = await Booking.findOne({ 
        user, 
        room: roomId,
        status: { $nin: ['cancel', 'rejected', 'completed'] } // Only count active bookings
    });

    if (existingBooking) {
        res.status(409);
        throw new Error("You already have an active booking for this room");
    }

    // Create new booking
    const booking = await Booking.create({
        user,
        room: roomId,
        // Defaults from schema will be applied automatically
    });

    // Populate room details in the response
    const populatedBooking = await Booking.findById(booking._id)
        .populate('room', 'name price') // Only include specific room fields
        .populate('user', 'fullName email'); // Only include specific user fields

    res.status(200).json(new ApiResponse(200, populatedBooking, "booked registered successfully"));
});

export { createBooking };