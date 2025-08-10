import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/UserSlice';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import toast from "react-hot-toast";

const Logout = ({ onClose, onLogout }) => {
    const dispatch = useDispatch();
    const nav = useNavigate();

    const handleLogout = async() => {
     try {
      const res = await axios.get("http://localhost:3000/api/user/logout",{
        withCredentials:true
      })
     if(!res){
      console.log("error in logout");
     } 
         dispatch(logout());
         toast.success("you have been logout ")
         nav("/");

     } catch (error) {
      console.log(error);
      
      
     }

    }
  return (
    <div className='fixed inset-0 bg-transparent bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center'>
        <h3 className='text-xl font-semibold mb-6 text-gray-800'>Do you want to logout?</h3>
        <div className='flex justify-center gap-6'>
          <button
            onClick={handleLogout}
            className='px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition'
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
