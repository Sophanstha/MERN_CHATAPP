import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import uploadFile from "../helper/Uploadfile";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();
  const url = "http://localhost:3000/api/Admin/register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    let uploadedPhotoUrl = "";
    if (photo) {
      const uploaded = await uploadFile(photo);
      if (uploaded?.secure_url) {
        uploadedPhotoUrl = uploaded.secure_url;
      }
    }

    try {
      const response = await axios.post(url, {
        name : name,
        email : email,
        password : password,
        profile_pic: uploadedPhotoUrl,
      });

      toast.success("Admin registered successfully!");
      if (response.data.success) {
        setName("");
        setEmail("");
        setPassword("");
        setPhoto(null);
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
      console.log(err);
    }
  };

  const handleClearPhoto = (e) => {
    e.preventDefault();
    setPhoto(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto mt-10"
    >
      <h2 className="text-3xl font-bold text-center mb-6">Admin Registration</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block font-medium mb-1">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Admin"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block font-medium mb-1">
              Password:
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 pr-11 rounded-md bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-gray-400 hover:text-white cursor-pointer focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Pic Upload */}
        <div className="flex flex-col gap-2">
          <label htmlFor="profile_pic" className="font-medium">
            Upload Photo:
          </label>

          <label
            htmlFor="profile_pic"
            className="flex items-center justify-between px-4 py-3 bg-gray-800 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-blue-500"
          >
            <span className="text-sm text-gray-300">
              {photo ? photo.name : "Choose a file"}
            </span>
            {photo && (
              <button onClick={handleClearPhoto} className="text-red-500 text-xl">
                <IoIosClose />
              </button>
            )}
          </label>

          <input
            type="file"
            id="profile_pic"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition"
      >
        Register as Admin
      </button>

      <p className="text-center text-gray-400 mt-4">
        Already have an admin account?
        <a href="/" className="text-blue-400 hover:underline ml-1">
          Login
        </a>
      </p>
    </form>
  );
};

export default AdminRegister;
