import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    fullName: "",
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get("/api/v1/users/profile", {
          withCredentials: true
        });
        setUserData(res.data.data);
        // setAllocatedRooms(res.data.data.rooms || []);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchUserProfile();
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with messages */}
        {(message || error) && (
          <div className={`p-4 rounded-lg ${message ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message || error}
          </div>
        )}
        
        {/* Profile Section - Top Div */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#7472E0] mb-6">Your Profile</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={userData.fullName}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full border rounded-lg p-3 focus:ring-[#7472E0] focus:border-[#7472E0]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full border rounded-lg p-3 focus:ring-[#7472E0] focus:border-[#7472E0]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Phone Number</label>
              <input
                type="tel"
                name="phoneNo"
                value={userData.phoneNo}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full border rounded-lg p-3 focus:ring-[#7472E0] focus:border-[#7472E0]"
              />
            </div>

            {editMode ? (
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#7472E0] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="bg-[#7472E0] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-all"
              >
                Edit Profile
              </button>
            )}
          </form>

          {/* Styled Password Section */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowPasswordForm((prev) => !prev)}
              className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-[#7472E0] bg-opacity-10 text-[#7472E0] rounded-lg hover:bg-opacity-20 font-medium transition-all"
            >
              {showPasswordForm ? "Hide Password Form" : "Change Password"}
            </button>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4 bg-gray-50 rounded-xl p-6">
                <div className="relative">
                  <label className="block text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 w-full border rounded-lg p-3 pr-10 focus:ring-[#7472E0] focus:border-[#7472E0]"
                    />
                    {passwordData.oldPassword && (
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 w-full border rounded-lg p-3 pr-10 focus:ring-[#7472E0] focus:border-[#7472E0]"
                    />
                    {passwordData.newPassword && (
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#7472E0] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-all"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Allocated Rooms Section - Bottom Div */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#7472E0] mb-6">Allocated Rooms</h2>

          {allocatedRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allocatedRooms.map((room, idx) => (
                <div key={idx} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <h4 className="font-semibold text-lg">{room.name || room.roomNumber || `Room ${idx+1}`}</h4>
                  <p className="text-sm text-gray-600">{room.address || room.building || "Main Building"}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {room.type || "Standard Room"}
                    </span>
                    <button 
                      onClick={() => navigate(`/rooms/${room._id || room.id}`)}
                      className="text-[#7472E0] hover:underline text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-xl text-center border border-gray-200">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Allocated Rooms</h3>
              <p className="text-gray-500">You don't have any rooms allocated to you at the moment.</p>
              <button 
                onClick={() => navigate('/rooms')}
                className="mt-4 px-6 py-3 bg-[#7472E0] text-white rounded-lg hover:opacity-90 font-medium transition-all"
              >
                Browse Available Rooms
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;