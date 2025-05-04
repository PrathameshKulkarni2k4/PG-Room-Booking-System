import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupImg from "../assets/signup.png"; // Using signupImg for UI

const OwnerSignup = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [countdownActive, setCountdownActive] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (countdownActive && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCountdownActive(false);
    }
    return () => clearInterval(interval);
  }, [countdownActive, timer]);

  const handleSendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSendingCode(true);
    setEmailStatus("");

    try {
      console.log("Sending code to email:", { email });
      await axios.post("/api/v1/verify/send-code", { email });
      setStep(2);
      setTimer(60);
      setCountdownActive(true);
      toast.success("Verification code sent to your email.");
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Failed to send code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }

    try {
      console.log("Verifying code:", { email, code });
      await axios.post("/api/v1/verify/verify-code", { email, code });
      setEmailVerified(true);
      setStep(3);
      toast.success("Email verified successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error?.response?.data?.message || "Incorrect code. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    if (!emailVerified) {
      toast.error("Please verify your email first.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const payload = {
      fullName: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      email: email.toLowerCase(),
      phoneNo: data.phone,
      password: data.password,
    };

    try {
      setLoading(true);
      const res = await axios.post("/api/v1/owner/register", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Signup successful! Redirecting to login...");
        reset();
        setTimeout(() => {
          navigate("/owner-login");
        }, 1500);
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Signup failed.");
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

      {/* Right Side Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6">
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-center text-[#7472E0] mb-6">
                Verify Your Email
              </h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-md"
              />
              {emailStatus && <p className="text-sm text-red-500 mb-2">{emailStatus}</p>}
              <button
                onClick={handleSendCode}
                disabled={isSendingCode}
                className={`w-full py-3 rounded-md transition ${
                  isSendingCode
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#7472E0] hover:bg-indigo-700 text-white"
                }`}
              >
                {isSendingCode ? "Sending Code..." : "Continue"}
              </button>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-center text-[#7472E0] mb-6">
                Enter Verification Code
              </h2>
              <div className="mb-4">
                <div className="grid grid-cols-6 gap-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => {
                        const newCode = [...verificationCode];
                        newCode[index] = e.target.value;
                        setVerificationCode(newCode);
                        if (e.target.value && index < 5) {
                          document.getElementById(`owner-code-${index + 1}`)?.focus();
                        }
                      }}
                      id={`owner-code-${index}`}
                      className="w-full p-3 border rounded-md text-center"
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm mb-4">
                {timer > 0 ? `Resend code in ${timer}s` : (
                  <button onClick={handleSendCode} className="text-[#7472E0] hover:underline">
                    Resend Code
                  </button>
                )}
              </p>
              <button
                onClick={handleVerifyCode}
                className={`w-full py-3 rounded-md transition bg-[#7472E0] hover:bg-indigo-700 text-white`}
              >
                Verify Code
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full text-center text-gray-600 text-sm mt-2 hover:underline"
              >
                Back to Email
              </button>
            </>
          )}

          {/* Step 3: Email Verified, Signup Form */}
          {step === 3 && emailVerified && (
            <>
              <h2 className="text-2xl font-bold text-center text-[#7472E0] mb-6">
                Create an Account
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("name", { required: "Full name is required", minLength: { value: 3, message: "Full name must be at least 3 characters" } })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.name && <p className="text-sm text-red-500 mb-2">{errors.name.message}</p>}

                <input
                  type="text"
                  placeholder="Username"
                  {...register("username", { required: "Username is required", minLength: { value: 3, message: "Username must be at least 3 characters" }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" } })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.username && <p className="text-sm text-red-500 mb-2">{errors.username.message}</p>}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  className="w-full p-3 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  {...register("phone", { required: "Phone number is required", pattern: { value: /^[0-9]{10,15}$/, message: "Phone number must be 10-15 digits" } })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.phone && <p className="text-sm text-red-500 mb-2">{errors.phone.message}</p>}

                <input
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" }, validate: (value) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(value) || "Password must contain letters and numbers" })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.password && <p className="text-sm text-red-500 mb-2">{errors.password.message}</p>}

                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirmPassword", { required: "Confirm password is required", validate: (value) => value === watch("password") || "Passwords do not match" })}
                  className="w-full p-3 border rounded-md"
                />
                {errors.confirmPassword && <p className="text-sm text-red-500 mb-2">{errors.confirmPassword.message}</p>}

                <button
                  type="submit"
                  disabled={loading || !emailVerified}
                  className={`w-full py-3 rounded-md transition ${
                    loading || !emailVerified
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#7472E0] hover:bg-indigo-700 text-white"
                  }`}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </form>
              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <a href="/owner-login" className="text-[#7472E0] hover:underline">
                  Login
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default OwnerSignup;