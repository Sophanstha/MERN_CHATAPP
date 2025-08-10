import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { data, useNavigate } from "react-router-dom";
const Adminlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const url = "http://localhost:3000/api/Admin/login";
  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  

  if (!email || !password) {
    toast.error("Please enter both email and password");
    return;
  }

  try {
    const response = await axios.post(url, { email, password }, {
      withCredentials: true,
    });
    if(!response){
      toast.error("Invalid email or password");
    }
    else{
      toast.success("loggng....")
      navigate("/dashboard",
        {
          state: {
            data : response?.data?.admin,
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || error.message);
  }
};
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Admin Login
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Don’t have an admin account?{" "}
          <a href="/AdminRegister" className="text-blue-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Adminlogin;
