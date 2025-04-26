import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { errorHandler } from "./utils/errorHandler.js"

const app = express()

//middleware
app.use(cors({ 
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


//configuration
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.route.js'
import roomRouter from './routes/room.route.js'
import ownerRoter from './routes/owner.route.js'

//routers declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/rooms", roomRouter)
app.use("/api/v1/owner", ownerRoter)

// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/login
// http://localhost:8000/api/v1/users/logout

// http://localhost:8000/api/v1/rooms/register

// http://localhost:8000/api/v1/owner/register
app.use(errorHandler)

export { app }