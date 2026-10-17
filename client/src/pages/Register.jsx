import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import uploadFile from "../helper/Uploadfile";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const urls = "http://localhost:3000/api/user/register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let uploadedPhotoUrl = "";
    if (photo) {
      setUploading(true);
      const uploadToast = toast.loading("Uploading photo...");
      try {
        const uploadPhoto = await uploadFile(photo);
        toast.dismiss(uploadToast);
        if (uploadPhoto?.secure_url) {
          uploadedPhotoUrl = uploadPhoto.secure_url;
        } else {
          toast.error("Photo upload failed, proceeding without photo");
        }
      } catch (err) {
        toast.dismiss(uploadToast);
        console.error("Photo upload error:", err);
      } finally {
        setUploading(false);
      }
    }

    try {
      const response = await axios.post(urls, {
        name,
        email,
        password,
        profile_pic: uploadedPhotoUrl,
      });

      toast.success("User created successfully");
      if (response.data.success) {
        setName("");
        setEmail("");
        setPassword("");
        setPhoto(null);
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
      console.log(error);
    }
  };

  const handleClearPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhoto(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 mt-5 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 max-w-md mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200"
    >
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white capitalize tracking-tight mb-2">
        Create Your Account
      </h2>

      {/* Name Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="font-medium text-sm text-slate-700 dark:text-slate-200">
          Full Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="bg-gray-50 dark:bg-slate-700/80 text-slate-800 dark:text-white px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-400"
          required
        />
      </div>

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

      {/* Password Field with Eye Icon */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-medium text-sm text-slate-700 dark:text-slate-200">
          Password:
        </label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="bg-gray-50 dark:bg-slate-700/80 text-slate-800 dark:text-white px-4 py-2.5 pr-11 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none w-full transition-all placeholder:text-gray-400 dark:placeholder:text-gray-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer p-1 focus:outline-none transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={19} /> : <FaEye size={19} />}
          </button>
        </div>
      </div>

      {/* File Upload - Optional */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="profile_pic" className="font-medium text-sm text-slate-700 dark:text-slate-200">
            Profile Photo:
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-400 font-normal">Optional</span>
        </div>
        
        <label
          htmlFor="profile_pic"
          className="h-14 bg-gray-50 dark:bg-slate-700/60 flex justify-between items-center px-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors"
        >
          <p className="text-sm text-slate-500 dark:text-slate-300 truncate">
            {photo ? photo.name : "Click to select a profile picture"}
          </p>
          {photo?.name && (
            <button
              type="button"
              className="text-xl text-red-500 hover:text-red-700 cursor-pointer p-1"
              onClick={handleClearPhoto}
              title="Remove photo"
            >
              <IoIosClose size={24} />
            </button>
          )}
        </label>

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
        disabled={uploading}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-base py-2.5 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
      >
        {uploading ? "Creating Account..." : "Register"}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
        Already have an account?
        <Link to="/" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline ml-1">
          Login
        </Link>
      </p>
    </form>
  );
};

export default Register;
