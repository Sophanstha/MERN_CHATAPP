import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import uploadFile from "../helper/Uploadfile";
import axios from 'axios';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  // const [photo, setPhoto] = useState(null);
  const [profile_pic, setProfile_pic] = useState(""); // Store uploaded image URL
  const navigate = useNavigate();
  const urls = "http://localhost:3000/api/user/register";
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (!photo) {
  //     alert("Please select a file before submitting.");
  //     return;
  //   }
  //   const uploadPhoto = await uploadFile(photo);
  //   if (uploadPhoto?.secure_url) {
  //     setProfile_pic(uploadPhoto.secure_url); // Store the uploaded URL
  //   } else {
  //     console.error("Upload failed:", uploadPhoto);
  //   }
  //   try {
  //     const response = await axios.post(urls, {name
  //       ,email
  //       ,password
  //       ,profile_pic
  //     });
      
  //     toast.success("User created successfully");
  //     if(response.data.success){
  //       setName("");
  //       setEmail("");
  //       setPassword("");
  //       setPhoto(null);
  //       setProfile_pic("");
  //       navigate("/");

  //     }
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message)
  //     console.log(error);
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!photo) {
      alert("Please select a file before submitting.");
      return;
    }
    const uploadPhoto = await uploadFile(photo);
    if (!uploadPhoto?.secure_url) {
      console.error("Upload failed:", uploadPhoto);
      return;
    }
    try {
      const response = await axios.post(urls, {
        name,
        email,
        password,
        profile_pic: uploadPhoto.secure_url, // Use directly instead of setProfile_pic
      });
  
      toast.success("User created successfully");
      if (response.data.success) {
        setName("");
        setEmail("");
        setPassword("");
        setPhoto(null);
        setProfile_pic("");
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    }
  };  





  const handleClearPhotot = (e)=>{
    e.preventDefault();
    e.stopPropagation()
    // e.stopPropagation()    
    setPhoto(null)
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 mt-5 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

      {/* Name Field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="font-medium">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="bg-gray-100 px-3 py-2 rounded-md border focus:border-blue-500 outline-none"
          required
        />
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-medium">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="bg-gray-100 px-3 py-2 rounded-md border focus:border-blue-500 outline-none"
          required
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-medium">
          Password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="bg-gray-100 px-3 py-2 rounded-md border focus:border-blue-500 outline-none"
          required
        />
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-1">
        <label htmlFor="profile_pic" className="font-medium">
          Photo:
        </label>
        
        {/* Fix: Make it clickable and open the file picker */}
        <label htmlFor="profile_pic" className="h-14 bg-gray-100 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500">
          {/* <div> */}
          <p className="text-sm text-gray-500">
            {photo ? photo.name : "Click to upload profile photo"}
          </p>
{  photo?.name && 
        <button className="text-lg ml-1 mt-1 hover:text-red-600"  onClick={handleClearPhotot}>
          <IoIosClose/>
          </button>

  }{/* </div> */}

        </label>

        {/* Hidden file input */}
        <input
          type="file"
          id="profile_pic"
          name="profile_pic"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Register Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-lg px-4 py-2 hover:bg-blue-600 rounded-md mt-4 font-semibold text-white transition-all"
      >
        Register
      </button>

      {/* Login Link */}
      <p className="text-center text-gray-600 mt-3">
        Already have an account?
        <a href="/" className="text-blue-500 font-medium hover:underline ml-1">
          Login
        </a>
      </p>
    </form>
  );
};

export default Register;
