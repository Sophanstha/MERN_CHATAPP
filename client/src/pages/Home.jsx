import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom'
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/UserSlice';
import Sidebar from '../component/Sidebar';
import logo from "../assets/logo.png";
import io from "socket.io-client"; 

const Home = () => {
  const user = useSelector(state => state.user);
  console.log("user : ",user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fecthUserData = async()=>{
    const urls = "http://localhost:3000/api/user/user-detail";
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
    const socket = io('http://localhost:3000',{
      auth : {
        token : localStorage.getItem('token')
      }
    });
    socket.on("onlineUser",(data)=>{
      // console.log(data);
      dispatch(setOnlineUser(data))

    })
dispatch(setSocketConnection(socket))

    return ()=>{
      socket.disconnect();
    }

  },[])
  return (
<div className="flex h-screen max-h-screen">
    <section className="bg-white w-72 flex-shrink-0">
        <Sidebar />
    </section>

    {/** Message component **/}
    <section className="flex-1 overflow-hidden">
        <Outlet />
    </section>

</div>

  )
}

export default Home