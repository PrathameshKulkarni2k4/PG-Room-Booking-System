import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // Step 1: send code, Step 2: verify code
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendCode = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/users/send-verification-code", { email });
      if (res.status === 200) {
        toast.success("Verification code sent to your email!");
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/users/verify-code", { email, code });
      if (res.status === 200) {
        toast.success("Email verified successfully!");
        setTimeout(() => {
          navigate("/complete-signup", { state: { email } }); // Pass email to next page
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#7472E0] mb-6">
          {step === 1 ? "Verify Your Email" : "Enter Verification Code"}
        </h2>

        {step === 1 ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-md"
            />
            <button
              onClick={sendCode}
              disabled={loading}
              className={`w-full py-3 rounded-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7472E0] hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter the code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 mb-4 border rounded-md"
            />
            <button
              onClick={verifyCode}
              disabled={loading}
              className={`w-full py-3 rounded-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7472E0] hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </>
        )}
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default VerifyEmail;
