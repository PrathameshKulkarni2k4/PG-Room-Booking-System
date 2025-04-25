import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Owner } from "../models/owner.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(ownerId) => {
    try {
        const owner = await Owner.findById(ownerId);
        const accessToken = owner.generateAccessToken();
        const refreshToken = owner.generateRefreshToken();

        owner.refreshToken = refreshToken;
        await owner.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};


const registerOwner = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, phoneNo } = req.body;

    if (
        [fullName, email, username, password, phoneNo].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedOwner = await Owner.findOne({
        $or: [{ username }, { email }]
    });

    if (existedOwner) {
        throw new ApiError(409, "Owner with email or username already exists");
    }

    const owner = await Owner.create({
        fullName,
        email,
        password,
        username,
        phoneNo
    });

    const createdOwner = await Owner.findById(owner._id).select(
        "-password -refreshToken"
    );

    if (!createdOwner) {
        throw new ApiError(500, "Something went wrong while registering an owner");
    }

    return res.status(201).json(
        new ApiResponse(200, createdOwner, "Owner registered successfully")
    );
});


const loginOwner = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const owner = await Owner.findOne({
        $or: [{ username }, { email }]
    });

    if (!owner) {
        throw new ApiError(404, "Owner does not exist");
    }

    const isPasswordValid = await owner.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(owner._id);

    const loggedInOwner = await Owner.findById(owner._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInOwner,
                accessToken,
                refreshToken
            }, "Owner logged in successfully")
        );
});


const logoutOwner = asyncHandler(async (req, res) => {
    await Owner.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Owner logged out"));
});

const getOwnerProfile = asyncHandler( async (req, res) => {
    const owner = await Owner.findById(req.user._id).select("-password -refreshToken").populate("rooms");

    if (!owner) {
        throw new ApiError(404,"Owner not found")
    }

    res.status(200)
    .json(new ApiResponse(200,owner,"owner fetched successfully"))
})

export {
    registerOwner,
    loginOwner,
    logoutOwner,
    getOwnerProfile
};
