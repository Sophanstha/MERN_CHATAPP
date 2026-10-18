import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/UserSlice';
import Sidebar from '../component/Sidebar';
import chatLogo from "../assets/chat-logo.png";
import io from "socket.io-client"; 
import { BACKEND_URL } from '../helper/apiUrl';

const Home = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isBasePath = location.pathname === "/home" || location.pathname === "/home/";

  const fecthUserData = async()=>{
    const urls = `${BACKEND_URL}/api/user/user-detail`;
    try {
      const response = await axios({
        method: 'GET',
        url: urls,
        withCredentials: true
      })
      dispatch(setUser(response.data.data))
      if(response.data.data.logout){
        dispatch(logout());
        navigate('/');
      }
    } catch (error) {
      console.error("error in response of fetch data in home",error);
    }
  }

  useEffect(()=>{
    fecthUserData();
  },[])

  // socket connection 
  useEffect(()=>{
    const socket = io(BACKEND_URL,{
      auth : {
        token : localStorage.getItem('token')
      }
    });
    socket.on("onlineUser",(data)=>{
      dispatch(setOnlineUser(data))
    })
    dispatch(setSocketConnection(socket))

    return ()=>{
      socket.disconnect();
    }
  },[])

  return (
    <div className="flex h-screen max-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar section */}
      <section className={`bg-white dark:bg-slate-900 w-full lg:w-80 lg:min-w-[320px] flex-shrink-0 h-full ${
        !isBasePath ? "hidden lg:flex" : "flex"
      }`}>
        <Sidebar />
      </section>

      {/* Main chat / placeholder section */}
      <section className={`flex-1 overflow-hidden h-full ${
        isBasePath ? "hidden lg:flex" : "flex"
      } flex-col`}>
        {isBasePath ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="p-4 bg-teal-50 dark:bg-slate-800/80 rounded-3xl shadow-inner border border-teal-100/60 dark:border-slate-700/80 mb-4 transition-transform hover:scale-105">
              <img src={chatLogo} alt="ChatApp" className="w-24 h-24 object-contain filter drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Welcome to ChatApp</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Select a conversation from the sidebar or search for users to start chatting in real time.
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </section>
    </div>
  )
}

export default Home