import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // ✅ toast import
import "react-toastify/dist/ReactToastify.css"; // ✅ toast css
import signupImg from "../assets/signup.png";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
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
        toast.success("Signup successful! Redirecting...");
        reset();
        setTimeout(() => {
          navigate("/rooms");
        }, 1500); // wait 1.5 sec for user to see success toast
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
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
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mb-2">
              Please confirm your password
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7472E0] hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a href="/user-login" className="text-[#7472E0] hover:underline">
              Login
            </a>
          </p>
          <p className="text-center text-sm mt-1">
            Create account as Owner{" "}
            <a href="/owner-register" className="text-[#7472E0] hover:underline">
              Create Owner
            </a>
          </p>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={2000} /> {/* ✅ Toast container */}
    </div>
  );
};

export default Signup;
