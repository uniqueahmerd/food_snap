import React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";
// import Button from "../component/Button";
// import { UseAuthStore } from "../store/AuthStore";
// import { toast } from "react-toastify";

const VerifyOtp = () => {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRef = useRef([]);
  const navigate = useNavigate();

  const { error, loading, verifyEmail, verifyOtp  } = useAuth();
  // Local UI-only state: small validation error for client-side checks and resend loading
  const [validationError, setValidationError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  //handle input change
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; //only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValidationError(""); // Clear local validation error when user types

    if (value && index < OTP_LENGTH - 1) {
      inputRef.current[index + 1].focus() ;
    }

    if (newOtp.every((digit) => digit !== "")) {
      triggerSubmit(newOtp);
    }
  };

  //handle backspace focus shift
  const handleKeyDown = (e: React.FormEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  //handle paste of full or partial otp
  const handlePaste = (e: React.FormEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .trim()
      .slice(0, OTP_LENGTH);
    if (!/^[0-9]+$/.test(pasteData)) return; //only allow numbers

    const newOtp = Array(OTP_LENGTH).fill("");
    pasteData.split("").forEach((char: string , i: number) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);
    setValidationError(""); // Clear local validation error on paste

    if (pasteData.length === OTP_LENGTH) {
      triggerSubmit(newOtp);
    } else {
      inputRef.current[pasteData.length]?.focus();
    }
  };

  //common submit handler
  const triggerSubmit = async (otpArray: string[]) => {
    const otpValue = otpArray.join("");

    try {
      // Use store action which manages its own loading/error state
      const response = await verifyOtp(otpValue);
      setSuccess(true);
      alert(response.message || "Email verified successfully!");
      
      // Optionally navigate or show success UI here
      navigate("/reset-password"); // Redirect to Home page after successful verification
    } catch (err: any) {
      // Show error toast and set store error
      alert(err.response?.data?.message || "Failed to verify email");
      console.error("[EmailVerificationPage] Verification error:", err);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    try {
      // TODO: Replace with actual resend API call
    //   await sendEmailVerificationCode();
      setResendTimer(20); // Start 30 second cooldown
      alert("Verification code resent successfully!");
    } catch (error) {
      console.error("Resend error:", error);
      alert("Failed to resend verification code. Please try again.");
      setValidationError("Failed to resend code. Please try again.");
      console.log(error);
      
    } finally {
      setResendLoading(false);
    }
  };

  // Effect to handle resend timer
  useEffect(() => {
    if (resendTimer <= 0) {
      setValidationError(""); // Clear local validation error when timer expires
      return;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    // Cleanup interval on unmount or when timer is reset
    return () => clearInterval(interval);
  }, [resendTimer]);

  //manual submit on button click
  const handleManualSubmit = () => {
    if (otp.some((digit) => digit === "")) {
      setValidationError("Please enter all digits");
      return;
    }

    triggerSubmit(otp);
  };

  return (
    <div className="max-h-screen flex justify-center items-center m-auto">
      <div className="p-8 max-w-md w-full backdrop-blur-3xl overflow-hidden rounded-3xl shadow-xl">
        <h2 className="font-bold text-3xl mb-6 text-center text-collage-blue bg-clip-text">
          Verify Your Email
        </h2>
        <p className="text-middle-blue text-center mb-6">
          Enter the 6-digit code sent to your email address.
        </p>

        <div className="flex justify-center space-x-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputRef.current[index] = el)}
              disabled={loading || success}
              className={`w-12 h-12 text-center font-medium px-1 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-green-500 focus:border-transparent transition-colors
                ${
                  validationError || error
                    ? "border-red-500"
                    : "border-picton-blue"
                }
                ${loading ? "opacity-50" : ""}
                ${success ? "border-green-500 bg-green-50" : ""}`}
            />
          ))}
        </div>

        {(validationError || error) && (
          <p className="text-red-500 text-sm text-center mb-4">
            {validationError || error}
          </p>
        )}

        {success && (
          <p className="text-green-500 text-sm text-center mb-4">
            OTP verified successfully!
          </p>
        )}

        <button
        onClick={handleManualSubmit}
          className="bg-gradient-to-r from-green-600 to-emerald-600 w-full mt-3 mb-3 
                  text-white hover: text-lg duration-300 flex items-center justify-center 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-all ease-in-out hover:scale-100 active:scale-90
                   py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  "
        >
          {loading ? (
            <Loader2 className="animate-spin size-4 text-middle-blue" />
          ) : (
            "Verify OTP"
          )}
        </button>

        <div className="mt-2 text-center">
          <button
            type="button"
            className={`text-middle-blue ${
              resendLoading || resendTimer > 0 || success
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleResendOTP}
            disabled={resendTimer > 0 || success || resendLoading}
          >
            {resendLoading
              ? "Sending..."
              : resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
