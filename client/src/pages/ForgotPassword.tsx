// import { Mail } from "lucide-react";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading]  = useState(false)
//   const { loading, sendingPasswordOtp, error} = UseAuthStore();
  const navigate = useNavigate()

  const handleSendingPasswordOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
         navigate("/verify-otp");    
      }

  return (
    <div className="max-h-screen flex justify-center items-center m-auto">
     <div className="max-w-md w-full backdrop-blur-3xl rounded-3xl shadow-xl">
      <div className="p-8 ">
        <h2
          className=" font-bold text-3xl mb-4 text-center"
        >
          Forgot Password
        </h2>
        <p className='text-center mb-3 text-middle-blue'>
          Enter your email address and we'll send you a verification code to reset your password
        </p>
        <form onSubmit={handleSendingPasswordOtp}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
            setEmail(e.target.value)}}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-green-500 focus:border-transparent transition-colors"
            placeholder="Enter your email"
            required
          />
          {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}

          <div className="mt-6">
             {/* <button loading={loading} value={"Send verification code" /> */}
             <button className="bg-gradient-to-r from-green-600 to-emerald-600 w-full mt-3 mb-2 
                  text-white hover: text-lg duration-300 flex items-center justify-center 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-all ease-in-out hover:scale-100 active:scale-90
                   py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  ">
                    {loading ? (
                            <Loader2 className="animate-spin size-4 text-middle-blue" />
                          ) : (
                            "Send verification code"
                          )}
             </button>
          </div>

        </form>
      </div>
    </div>
    </div>
  )
}

export default ForgotPassword;