import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("/api/v1/owner/register", data);
      navigate("/owner-login"); // ✅ Redirect after successful signup
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#7472E0]">Owner Signup</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Full Name"
            {...register("name", { required: "Name is required" })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.name && <p className="text-sm text-red-500 mb-2">{errors.name.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "Enter a valid email",
              },
            })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.email && <p className="text-sm text-red-500 mb-2">{errors.email.message}</p>}

          <input
            type="tel"
            placeholder="Phone Number"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
            })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.phone && <p className="text-sm text-red-500 mb-2">{errors.phone.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.password && <p className="text-sm text-red-500 mb-2">{errors.password.message}</p>}

          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            className="w-full p-3 mb-4 border rounded-md"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mb-2">{errors.confirmPassword.message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#7472E0] text-white font-semibold py-3 rounded-md hover:bg-[#5e5ccd] transition"
          >
            Sign Up
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <span
              className="text-[#7472E0] cursor-pointer hover:underline"
              onClick={() => navigate("/owner/login")}
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
