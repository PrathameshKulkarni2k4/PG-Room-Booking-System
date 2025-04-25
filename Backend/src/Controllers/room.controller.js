import { Room } from "../models/room.model.js";
import { Owner } from "../models/owner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geocoder } from "../utils/geocoder.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"

const registerRoom = asyncHandler(async (req, res) => {
    const {
        name,
        address,
        price,
    } = req.body;

    const facilities = JSON.parse(req.body.facilities);

    if (!name || !address || !price) {
        throw new ApiError(400, "Name, address and price are required");
    }

    let coordinates = req.body.coordinates;
    if (!coordinates || !coordinates.length) {
        const geoData = await geocoder.geocode(address);
        if (!geoData.length) {
            throw new ApiError(400, "Invalid address. Unable to geocode.");
        }
        coordinates = [geoData[0].longitude, geoData[0].latitude];
    }

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }

    const imageUrls = await Promise.all(
        req.files.map(async (file) => {
            const result = await uploadOnCloudinary(file.path);
            if (!result?.url) {
                throw new ApiError(500, "Failed to upload images");
            }
            return result.url;
        })
    );

    const newRoom = await Room.create({
        name,
        address,
        location: {
            type: "Point",
            coordinates
        },
        price,
        facilities: facilities || [],
        images: imageUrls,
        owner: req.user._id
    });

    await Owner.findByIdAndUpdate(
        req.user._id,
        { $push: { rooms: newRoom._id } },
        { new: true }
    );

    return res
        .status(201)
        .json(new ApiResponse(201, newRoom, "Room registered successfully"));
});

const getNearbyAvailableRooms = asyncHandler(async (req, res) => {
    const { longitude, latitude, radius = 5000, minPrice, maxPrice } = req.query;

    if (!longitude || !latitude) {
        throw new ApiError(400, "Longitude and latitude are required");
    }

    const query = {
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                $maxDistance: parseFloat(radius)
            }
        },
        status: "Available"
    };

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const rooms = await Room.find(query)
        .populate('owner', 'username email phoneNo')
        .select('-__v');

    return res
        .status(200)
        .json(new ApiResponse(200, rooms, "Nearby rooms fetched successfully"));
});

const getRoomProfile = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
        .populate('owner', 'username email phoneNo')
        .populate('feedback.user', 'username');

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, room, "Room details fetched"));
});

const updateRoomStatus = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["Available", "Booked"];
    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const updatedRoom = await Room.findOneAndUpdate(
        { _id: roomId, owner: req.user._id },
        { $set: { status } },
        { new: true }
    );

    if (!updatedRoom) {
        throw new ApiError(404, "Room not found or unauthorized");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRoom, "Room status updated"));
});

const updateRoomPrice = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { price } = req.body;

    const updatedRoom = await Room.findOneAndUpdate(
        { _id: roomId, owner: req.user._id },
        { $set: { price } },
        { new: true }
    )

    if (!updatedRoom) {
        throw new ApiError(404, "Room not found or unauthorized");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRoom, "Room price updated"))
})

const addRoomFeedback = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { comment, rating } = req.body;

    const feedback = {
        user: req.user._id,
        comment,
        rating
    };

    const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $push: { feedback } },
        { new: true }
    );

    if (rating) {
        const avgRating = updatedRoom.feedback.reduce(
            (acc, curr) => acc + curr.rating, 0) / updatedRoom.feedback.length;
        await Room.findByIdAndUpdate(roomId, { rating: avgRating });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRoom, "Feedback added successfully"));
});

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    console.log("Deleting Room:", roomId, "Owner:", req.user._id);
    const room = await Room.findOneAndDelete({
        _id: roomId,
        owner: req.user._id
    });

    if (!room) {
        throw new ApiError(404, "Room not found or unauthorized");
    }

    await Promise.all(
        room.images.map(imageUrl =>
            deleteFromCloudinary(imageUrl).catch(console.error)
        )
    );

    return res
        .status(204)
        .json(new ApiResponse(204, null, "Room deleted successfully"));
});

const getAvailableRooms = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice, facilities } = req.query;

    const filter = {
        status: "Available"
    };

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (facilities) {
        const facilitiesArray = Array.isArray(facilities)
            ? facilities
            : facilities.split(",");
        filter.facilities = { $all: facilitiesArray };
    }

    const rooms = await Room.find(filter)
        .populate("owner", "username email phoneNo")
        .select("-__v");

    if (!rooms) {
        throw new ApiError(404,"no available rooms")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, rooms, "Available rooms fetched successfully"));
});

export {
    registerRoom,
    getNearbyAvailableRooms,
    getAvailableRooms,
    getRoomProfile,
    updateRoomStatus,
    updateRoomPrice,
    addRoomFeedback,
    deleteRoom
};