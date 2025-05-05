import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { Room } from '../models/room.model.js';
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendNotification } from "../utils/notification.service.js";
import { Notification } from "../models/notification.model.js";

const createBooking = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user._id;

    // 1. Create booking
    const booking = await Booking.create({
        user: userId,
        room: roomId,
        status: "pending",
    });

    // 2. Fetch room details (to get ownerId)
    const room = await Room.findById(roomId).populate('owner');

    // 3. Send notification to room owner
    await sendNotification(req.app.get('io'), {
        receiverId: room.owner._id,
        receiverModel: "Owner",
        message: `New booking request for ${room.name}`,
        type: "booking",
        bookingId: booking._id,
        roomId: room._id
    });

    return res.status(200).json(
        new ApiResponse(200, booking, "Room booked successfully")
    );
});

const updateBookingStatus = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { status, notificationId } = req.body;

    const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
    ).populate('user', 'name email');

    await Notification.findByIdAndUpdate(notificationId, { read: true });

    // 1. Send notification to the user
    await sendNotification(req.app.get('io'), {
        receiverId: booking.user._id,
        receiverModel: "User",
        message: `Your booking has been ${status}`,
        type: "booking-status",
        bookingId: booking._id,
        roomId: booking.room
    });

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking status has changed")
    )
});

export {
    createBooking,
    updateBookingStatus
};
