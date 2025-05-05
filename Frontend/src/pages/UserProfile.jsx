import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { FaBell, FaUser, FaEnvelope, FaPhoneAlt, FaLock, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useSocket } from "../context/SocketContext.jsx";

const UserProfile = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNo: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [allocatedRooms, setAllocatedRooms] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClearing, setIsClearing] = useState(false);


  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("/api/v1/users/profile", {
        withCredentials: true
      });
      console.log(res);

      if (res.data.success) {
        const { user, notifications } = res.data.data;
        setUserData(user);
        setNotifications(notifications);
        setUnreadCount(notifications.length);
        setAllocatedRooms(res.data.data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // navigate("/user-login");
    }
  };

  useEffect(() => {
    fetchUserProfile();

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

  const handleInputChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch("/api/v1/users/profile", userData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      setMessage(res.data.message);
      setError("");
      setEditMode(false);
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch("/api/v1/users/profile/password", passwordData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      setMessage(res.data.message);
      setError("");
      setPasswordData({ oldPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Password change failed");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/users/logout", {}, { withCredentials: true });
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8 relative">

        {/* Notifications */}
        <div className="absolute right-10 top-5  gap-3">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
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

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-lg z-20 max-h-96 overflow-y-auto">
              <div className="p-4 font-semibold border-b text-gray-700 flex justify-between items-center">
                <span>Notifications</span>
                <button
                  className={`text-xs text-[#7472E0] hover:underline ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isClearing}
                  onClick={async () => {
                    setIsClearing(true);
                    try {
                      await axios.delete("/api/v1/users/notifications/clear", {
                        withCredentials: true,
                      });
                      setNotifications([]);
                      setUnreadCount(0);
                      setShowNotifications(false);
                    } catch (error) {
                      console.error("Failed to clear notifications:", error);
                    } finally {
                      setIsClearing(false);
                    }
                  }}
                >
                  {isClearing ? "Clearing..." : "Clear all"}
                </button>
              </div>

              {notifications.length > 0 ? (
                notifications.map((note, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (note._id) {
                        navigate(`/notifications/${note._id}`);
                      }
                      setShowNotifications(false);
                    }}
                  >
                    <p className="text-sm">{note.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400">No notifications yet</div>
              )}
            </div>
          )}

          <div className="mb-8 flex justify-between items-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
            >
              <FaSignOutAlt /> Log Out
            </button>
          </div>
 
        </div>

        {/* Header */}



        {/* Alert Messages */}
        {(message || error) && (
          <div className={`mb-6 p-3 rounded-md ${message ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message || error}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="fullName"
                    value={userData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-2 border-[#7472E0] shadow-sm focus:border-[#7472E0] focus:ring-[#7472E0] sm:text-sm p-2 bg-gray-50"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{userData.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Username</label>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-2 border-[#7472E0] shadow-sm focus:border-[#7472E0] focus:ring-[#7472E0] sm:text-sm p-2 bg-gray-50"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{userData.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Email Address</label>
                <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
              </div>

              {/* Phone No */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phoneNo"
                    value={userData.phoneNo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-2 border-[#7472E0] shadow-sm focus:border-[#7472E0] focus:ring-[#7472E0] sm:text-sm p-2 bg-gray-50"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{userData.phoneNo}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>
              {editMode && (
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Old Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setShowOldPassword(!showOldPassword)}>
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-2 px-4 bg-[#7472E0] text-white rounded-md hover:bg-[#5a58d6]">
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Allocated Rooms */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Allocated Rooms</h3>
          {allocatedRooms.length > 0 ? (
            <ul className="list-disc ml-5 space-y-2">
              {allocatedRooms.map((room, index) => (
                <li key={index} className="text-gray-800">{room.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No rooms allocated yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
