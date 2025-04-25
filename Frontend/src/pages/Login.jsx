import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/signup.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        "/api/v1/users/login", 
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Save token & user data
        const { accessToken, user } = response.data.data;
        console.log(response);
        

        localStorage.setItem("usertoken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        setMessage({ type: "success", text: `${response.data.message}` });
        console.log("Redirecting to /rooms");
        setTimeout(()=>{
          navigate("/rooms");
        },2000);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed. Try again.",
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

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-[#7472E0] mb-6">
            Welcome Back
          </h2>

          {message.text && (
            <p
              className={`text-center mb-4 ${
                message.type === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {message.text}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7472E0]"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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
              Login
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <a href="/user-register" className="text-[#7472E0] hover:underline">
              Sign Up
            </a>
          </p>
          <p className="text-center text-sm mt-1">
            Login as Owner{" "}
            <a href="/owner-login" className="text-[#7472E0] hover:underline">
              OwnerLogin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
