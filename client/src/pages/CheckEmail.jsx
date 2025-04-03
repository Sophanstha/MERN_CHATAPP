import React, { useState } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
const CheckEmail = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    const urls = "http://localhost:3000/api/user/email";
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
      className="grid gap-4 mt-5 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center mb-4">check email</h2>
<div className="w-full flex justify-center items-center">
<FaUserAstronaut style={{ width: 100, height: 100, color: "#00ADB5" }}/>
</div>
   

      {/* Email Field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-medium">
          Email:
        </label>
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="bg-gray-100 px-3 py-2 rounded-md border focus:border-blue-500 outline-none"
          required
        />
      </div>


      {/* Register Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-lg px-4 py-2 hover:bg-blue-600 rounded-md mt-4 font-semibold text-white transition-all"
      >
         Let's Go
      </button>
    </form>
              <p className='my-3 text-center'>New User ? <Link to={"/register"} className='hover:text-primary font-semibold'>Register</Link></p>
</>
  );
}

export default CheckEmail