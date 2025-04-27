import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBooking } from "../controllers/booking.controller.js";

const router = Router()

router.route("/create-booking/:roomId").post(upload.none(), verifyJWT, createBooking) // create a booking

export default router