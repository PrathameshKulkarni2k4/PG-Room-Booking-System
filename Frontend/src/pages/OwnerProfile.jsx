import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaEdit,
  FaPlus,
  FaHome,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const OwnerProfile = () => {
  const [ownerData, setOwnerData] = useState(null);

  const fetchOwnerProfile = async () => {
    try {
      const res = await axios.get("/api/v1/owner/profile", {
        withCredentials: true,
      });
      if (res.data.success) {
        setOwnerData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching owner profile:", error);
    }
  };

  useEffect(() => {
    fetchOwnerProfile();
  }, []);

  const handleDeleteRoom = async (roomId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/v1/rooms/${roomId}`, { withCredentials: true });
      setOwnerData((prevData) => ({
        ...prevData,
        rooms: prevData.rooms.filter((room) => room._id !== roomId),
      }));
      alert("Room deleted successfully");
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Failed to delete room");
    }
  };

  if (!ownerData) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-[#7472E0] mb-2">Owner Profile</h2>
        <p className="text-gray-600">
          Manage your property listings and profile information
        </p>
      </div>

      {/* Owner Info */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 grid sm:grid-cols-2 gap-6">
        <div className="flex items-start gap-4">
          <FaUser className="text-[#7472E0] text-xl mt-1" />
          <div>
            <p className="font-semibold text-gray-700 text-sm">Name</p>
            <p className="text-lg">{ownerData.fullName}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <FaEnvelope className="text-[#7472E0] text-xl mt-1" />
          <div>
            <p className="font-semibold text-gray-700 text-sm">Email</p>
            <p className="text-lg">{ownerData.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <FaPhoneAlt className="text-[#7472E0] text-xl mt-1" />
          <div>
            <p className="font-semibold text-gray-700 text-sm">Contact</p>
            <p className="text-lg">{ownerData.phoneNo}</p>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FaHome className="text-[#7472E0]" /> Listed Properties
        </h3>
        <Link
          to="/add-room"
          className="flex items-center gap-2 bg-[#7472E0] text-white px-5 py-2.5 rounded-lg hover:bg-[#5d5bd1] transition text-sm"
        >
          <FaPlus /> Add New Room
        </Link>
      </div>

      {/* Room Cards */}
      {ownerData.rooms.map((room) => (
        <div
          key={room._id}
          onClick={() => window.location.href = `/rooms/${room._id}`}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition relative cursor-pointer"
        >
          <h4 className="text-xl font-semibold text-[#7472E0] mb-2">{room.name}</h4>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-gray-700">Location:</span> {room.address}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium text-gray-700">Price:</span> ₹{room.price}
          </p>

          <div className="flex justify-between items-center mt-4">
            <Link
              to={`/edit-room/${room._id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-[#7472E0] text-sm font-medium hover:underline"
            >
              <FaEdit /> Edit Room Details
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRoom(room._id);
              }}
              className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      ))}

    </div>
  );
};

export default OwnerProfile;
