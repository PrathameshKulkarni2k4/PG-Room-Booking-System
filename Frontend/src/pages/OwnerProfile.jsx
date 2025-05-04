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
import { useSocket } from "../context/SocketContext"; // Import useSocket

const OwnerProfile = () => {
  const socket = useSocket(); // Use socket from context
  const [ownerData, setOwnerData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchOwnerProfile = async () => {
    try {
      const res = await axios.get("/api/v1/owner/profile", {
        withCredentials: true,
      });
      if (res.data.success) {
        const { owner, notifications } = res.data.data;
        setOwnerData(owner);
        setNotifications(notifications);
        setUnreadCount(notifications.length);
      }
    } catch (error) {
      console.error("Error fetching owner profile:", error);
    }
  };

  const markAllNotificationsAsRead = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchOwnerProfile();

    if (!socket) return; // If socket not ready, return early

    const handleNewNotification = (notification) => {
      console.log('📩 New notification received:', notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket]);

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
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-[#7472E0] mb-2">Owner Profile</h2>
        <p className="text-gray-600">Manage your property listings and profile information</p>
      </div>

      {/* Notifications Button */}
      <div className="absolute right-10 top-8">
        <button
          onClick={() => {
            setShowNotifications((prev) => !prev);
            if (!showNotifications) {
              markAllNotificationsAsRead();
            }
          }}
          className="relative p-2 bg-[#7472E0] text-white rounded-full"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-4 font-semibold border-b text-gray-700 flex justify-between items-center">
              <span>Notifications</span>
              <button
                className="text-xs text-[#7472E0] hover:underline"
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                  setShowNotifications(false);
                }}
              >
                Clear all
              </button>
            </div>

            {notifications.length > 0 ? (
              notifications.map((note, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b"
                  onClick={() => {
                    if (note.bookingId) {
                      window.location.href = `/bookings/${note.bookingId}`;
                    }
                    setShowNotifications(false);
                  }}
                >
                  <p className="text-sm">{note.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">No notifications yet</div>
            )}
          </div>
        )}
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
      {ownerData.rooms.length > 0 ? (
        ownerData.rooms.map((room) => (
          <div
            key={room._id}
            onClick={() => window.location.href = `/rooms/${room._id}`}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition relative cursor-pointer mb-6"
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
        ))
      ) : (
        <p className="text-center text-gray-500">No rooms listed yet.</p>
      )}
    </div>
  );
};

export default OwnerProfile;
