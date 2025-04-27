import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: "Booking"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})


export const Booking = mongoose.model("Booking",bookingSchema)