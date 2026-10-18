import React, { useState } from "react";
import chatLogo from "../assets/chat-logo.png";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../helper/apiUrl";

const CheckEmail = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    const urls = `${BACKEND_URL}/api/user/email`;
    e.preventDefault();
    e.stopPropagation();  
    try {
      const response = await axios.post(urls, {email});

      toast.success(response.data.message)
      if(response.data.success){
        setEmail("");       
        navigate("/checkpassword",{
          state: response?.data?.data
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
      console.log(error);
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 mt-5 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 max-w-md mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200"
      >
        <div className="w-full flex justify-center items-center mb-1">
          <div className="p-3 bg-teal-50 dark:bg-slate-700/60 rounded-2xl shadow-inner border border-teal-100/60 dark:border-slate-600/80 transition-all">
            <img 
              src={chatLogo} 
              alt="Chat Icon" 
              className="w-24 h-24 object-contain filter drop-shadow-sm hover:scale-105 transition-transform"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white capitalize tracking-tight mb-2">
          Welcome to ChatApp
        </h2>

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-medium text-sm text-slate-700 dark:text-slate-200">
            Email Address:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="bg-gray-50 dark:bg-slate-700/80 text-slate-800 dark:text-white px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-400"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-base py-2.5 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
        >
          Let's Go
        </button>
      </form>
      <p className='my-4 text-center text-sm text-slate-600 dark:text-slate-400'>
        New User? <Link to={"/register"} className='text-teal-600 dark:text-teal-400 hover:underline font-semibold'>Register</Link>
      </p>
    </>
  );
}

export default CheckEmail;