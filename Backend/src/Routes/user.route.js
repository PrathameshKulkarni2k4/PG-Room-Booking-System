import { Router } from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, updateUserDetails, changeCurrentPassword } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.none(),registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/profile").get(verifyJWT, getUserProfile)
router.route("/profile").patch(upload.none(), verifyJWT, updateUserDetails)
router.route("/profile/password").patch(upload.none(), verifyJWT, changeCurrentPassword)

export default router