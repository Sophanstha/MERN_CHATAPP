import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/UserSlice';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import toast from "react-hot-toast";
import { BACKEND_URL } from '../helper/apiUrl';

const Logout = ({ onClose, onLogout }) => {
    const dispatch = useDispatch();
    const nav = useNavigate();

    const handleLogout = async() => {
     try {
      const res = await axios.get(`${BACKEND_URL}/api/user/logout`,{
        withCredentials:true
      })
     if(!res){
      console.log("error in logout");
     } 
         localStorage.removeItem("token");
         localStorage.removeItem("user");
         dispatch(logout());
         toast.success("You have been logged out");
         nav("/");

     } catch (error) {
      console.log(error);
      
      
     }

    }
  return (
    <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4'>
      <div className='bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center text-slate-800 dark:text-white transition-colors'>
        <h3 className='text-xl font-semibold mb-6 text-slate-800 dark:text-white'>Do you want to logout?</h3>
        <div className='flex justify-center gap-4'>
          <button
            onClick={handleLogout}
            className='px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow cursor-pointer font-medium text-sm'
          >
            Yes, Logout
          </button>
          <button
            onClick={onClose}
            className='px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer font-medium text-sm'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
