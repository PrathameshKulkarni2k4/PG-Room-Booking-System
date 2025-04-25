import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from '../assets/signup.png'; // Image

const OwnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        password: formData.password,
      };

      // Determine whether user entered email or username
      if (formData.identifier.includes("@")) {
        payload.email = formData.identifier;
      } else {
        payload.username = formData.identifier;
      }

      const response = await axios.post("/api/v1/owner/login", payload);

      if (response.status === 200) {
        const { accessToken, user } = response.data.data;

        localStorage.setItem("ownertoken", accessToken);
        localStorage.setItem("owner", JSON.stringify(user));

        setMessage({ type: "success", text: "Owner login successful!" });
        navigate("/owner"); 
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed! Try again.",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Left Image Section */}
      <div className="md:w-1/2 hidden md:flex items-center justify-center bg-[#7472E0] rounded-r-3xl overflow-hidden pr-8">
        <img
          src={loginImage}
          alt="Login"
          className="w-full h-full object-contain rounded-r-3xl"
        />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-[#7472E0] mb-6">
            Owner Login
          </h2>

          {message.text && (
            <p
              className={`text-center mb-4 ${
                message.type === "error"
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {message.text}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7472E0]"
              type="text"
              name="identifier"
              placeholder="Username or Email"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7472E0]"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#7472E0] text-white font-semibold rounded-xl hover:bg-[#5e5ccd] transition"
            >
              Login as Owner
            </button>
          </form>

          <p className="text-center text-sm mt-4">
  Create account as Owner{" "}
  <a href="/owner-register" className="text-[#7472E0] hover:underline">
    Owner
  </a>
  <br />
  Login as a User{" "}
  <a href="/user-login" className="text-[#7472E0] hover:underline">
    Login as User
  </a>
</p>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
