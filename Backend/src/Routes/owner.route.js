import { Router } from "express";
import { registerOwner, loginOwner, logoutOwner, getOwnerProfile } from "../controllers/owner.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.none(),registerOwner)
router.route("/login").post(loginOwner)
router.route("/logout").post(verifyJWT, logoutOwner)

router.route("/profile").get(verifyJWT, getOwnerProfile)


export default router