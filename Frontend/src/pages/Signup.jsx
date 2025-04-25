import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import signupImg from "../assets/signup.png";

const Signup = () => {
  // const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setMessage("");
  
    if (data.password !== data.confirmPassword) {
      return setMessage("Passwords do not match");
    }
  
    try {
      const userData = {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        phoneNo: data.phone,
        password: data.password,
      };
  
      const res = await axios.post("/api/v1/users/register", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (res.status === 201 || res.status === 200) {
        setMessage("Signup successful!");
        navigate("/rooms");
        reset();
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };
  
  
  

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50">
      {/* Left Image Side */}
      <div className="hidden md:flex w-1/2 h-full">
        <img
          src={signupImg}
          alt="Signup Visual"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-[#7472E0] mb-6">
            Create an Account
          </h2>

          {message && (
            <p className={`text-sm text-center mb-4 ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <input
            type="text"
            placeholder="Full Name"
            {...register("fullName", { required: true })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mb-2">Full name is required</p>
          )}

          <input
            type="text"
            placeholder="Username"
            {...register("username", { required: true })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.username && (
            <p className="text-sm text-red-500 mb-2">Username is required</p>
          )}

          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: true,
              pattern: /^\S+@\S+$/i,
            })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mb-2">Valid email is required</p>
          )}

          <input
            type="tel"
            placeholder="Phone Number"
            {...register("phone", {
              required: true,
              minLength: 10,
              maxLength: 15,
            })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mb-2">
              Valid phone number is required
            </p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: true, minLength: 6 })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.password && (
            <p className="text-sm text-red-500 mb-2">
              Password must be at least 6 characters
            </p>
          )}

          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", { required: true })}
            className="w-full p-3 mb-6 border rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-[#7472E0] text-white py-3 rounded-md hover:bg-indigo-700 transition"
          >
            Sign Up
          </button>
          <p className="text-center text-sm mt-4">
            Login as User{" "}
            <a href="/user-login" className="text-[#7472E0] hover:underline">
              User Login
            </a>
          </p>
          <p className="text-center text-sm mt-1">
             Create account as Owner{" "}
            <a href="/owner-register" className="text-[#7472E0] hover:underline">
              CreateOwner
            </a>
          </p>
        </form>
        
      </div>
    </div>
  );
};

export default Signup;
