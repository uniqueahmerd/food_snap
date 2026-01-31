import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { UseAuthStore } from '../store/AuthStore';
// import Input from '../component/Input';
// import Button from '../component/Button';
// import Footer from '../component/Footer';

const ResetPassword = () => {
   
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [err, setErr] = useState("")
  const { loading, resetPassword, error } = useAuth();
  const navigate = useNavigate()

  const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
         if (password !== confirmPassword){
         setErr("Password does not match")
         alert("Password does not match");
         return
         }

         await resetPassword(password);
         alert("You have successfully reset your password");
         navigate("/login");
         
      
    }

  return (
    <div className="max-h-screen flex justify-center items-center m-auto">
      <div className="p-8 max-w-md w-full bg-persian-blue backdrop-blur-3xl overflow-hidden rounded-3xl shadow-xl">
        <h2 className=" font-bold text-3xl mb-6 text-center text-collage-blue bg-clip-text">
          Reset Password
        </h2>

        <form onSubmit={handlePasswordReset}>
          
            <input
              type="password"
              value={password}
              onChange={(e: React.FormEvent) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-green-500 focus:border-transparent transition-colors mb-3"
              placeholder="New password"
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e: React.FormEvent) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-green-500 focus:border-transparent transition-colors"
            />
        

          {error ? (
            <p className="text-red-500 text-sm mt-1.5">{error}</p>
          ) : (
            <p className="text-red-500 text-sm mt-1.5">{err}</p>
          )}

          <div className="mt-2">
            <button
              // onClick={handleManualSubmit}
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
          </div>
        </form>
      </div>
      {/* <Footer text1={"Back to"} text2={"Login"} to={"/login"} /> */}
    </div>
  );
}

export default ResetPassword;