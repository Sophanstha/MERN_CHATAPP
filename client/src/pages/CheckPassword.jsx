import React, { useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../component/Avatar";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../redux/UserSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BACKEND_URL } from "../helper/apiUrl";

const CheckPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const userId = data?._id; 
  const dispatch = useDispatch();

  useEffect(() => {
    if (!data?.name) {
      navigate("/");
    }
  }, [data, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();  

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/password`,
        { password, userid: userId },
        { withCredentials: true } 
      );

      toast.success(response.data.message);
      if (response.data.success) {
        dispatch(setToken(response?.data?.token));
        localStorage.setItem("token", response?.data?.token);
        if (data?._id) {
          dispatch(setUser(data));
          localStorage.setItem("user", JSON.stringify(data));
        }
        navigate("/home");
        setPassword("");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 mt-5 p-6 sm:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700 max-w-md mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200"
      >
        <div className="w-full flex flex-col justify-center items-center gap-2 mb-2">
          <Avatar name={data?.name} profile_pic={data?.profile_pic} width={90} height={90} />
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white capitalize">
            {data?.name}
          </h3>
        </div>

        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white capitalize tracking-tight">
          Enter Password
        </h2>

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

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-base py-2.5 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
        >
          Login
        </button>
      </form>
      <p className='my-4 text-center text-sm text-slate-600 dark:text-slate-400'>
        New User? <Link to={"/register"} className='text-teal-600 dark:text-teal-400 hover:underline font-semibold'>Register</Link>
      </p>
    </>
  );
};

export default CheckPassword;
