import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { FiArrowUpLeft } from "react-icons/fi";
import { FaImage, FaVideo } from "react-icons/fa6";
import Avatar from "./Avatar";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import EditUserDetail from "./EditUserDetail";
import Divider from "./Divider";
import SearchUser from "./SearchUser";
import Logout from "./Logout";
const Sidebar = () => {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
    const [allUser,setAllUser] = useState([]);
    const socketConnection = useSelector(
        (state) => state?.user?.socketConnection
      );
      useEffect(()=>{
        if(socketConnection){
            socketConnection.emit('sidebar',user?._id);
            socketConnection.on('conversion',(data)=>{
              // console.log("conversionData",data);
              const conversionUserData = data?.map((uconv,index)=>{
                if(uconv?.sender?._id === uconv?.receiver?._id){
                  return{
                    ...uconv,
                    userDetails : uconv?.sender
                  }
                }
                else if(uconv?.receiver._id !== user._id){
                  return{
                    ...uconv,
                    userDetails : uconv?.receiver
                  }
                }
                else{
                  return{
                    ...uconv,
                    userDetails : uconv?.sender

                  }
                }
              })
              setAllUser(conversionUserData);
            })
        
        }
    },[socketConnection,user])
  
  
    return (
    <div className="w-full h-full flex bg-white">
      {/* Sidebar */}
      <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
        <div>
          <NavLink
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${
                isActive && "bg-slate-200"
              }`
            }
            title="chat"
          >
            <IoChatbubbleEllipses size={20} />
          </NavLink>
          <NavLink
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
            title="add friend"
            onClick={() => setOpenSearchUser(true)}
          >
            <FaUserPlus size={20} />
          </NavLink>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="mx-auto"
            title="User Name"
            onClick={() => setEditUserOpen(true)}
          >
            <Avatar
              width={40}
              height={40}
            userid={user?._id}
              name={user.name}
              profile_pic={user?.profile_pic}
              userId="1"
            />
          </button>
          <button
            onClick={()=>setOpenLogout(true)}
            title="logout"
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
          >
            <span className="-ml-2">
              <BiLogOut size={20} />
            </span>
          </button>
        </div>
      </div>

      {/* Messages Section */}
      <div className="w-full bg-gray-100">
        <div className="h-16 flex items-center">
          <h2 className="text-xl font-bold p-4 text-slate-800">Message</h2>
        </div>
        <Divider />

        <div className=' h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
        {
                        allUser.length === 0 && (
                            <div className='mt-12'>
                                <div className='flex justify-center items-center my-4 text-slate-500'>
                                    <FiArrowUpLeft
                                        size={50}
                                    />
                                </div>
                                <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>    
                            </div>
                        )
                    }
   {allUser.map((conv, index) => {
    return (
        <NavLink 
            to={`/home/${conv?.userDetails?._id}`} 
            key={conv?._id} 
            className={({ isActive }) => 
                `flex items-center gap-2 py-3 px-2 border border-transparent rounded hover:border-blue-400 hover:bg-slate-300 cursor-pointer ${
                    isActive ? "bg-blue-200 text-white" : ""
                }`
            }
        >
            <div>
                <Avatar
                    profile_pic={conv?.userDetails?.profile_pic}
                    name={conv?.userDetails?.name}
                    width={40}
                    height={40}
                />    
            </div>
            <div>
                <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.userDetails?.name}</h3>
                <div className='text-slate-500 text-xs flex items-center gap-1'>
                    <div className='flex items-center gap-1'>
                        {conv?.lastMsg?.imageUrl && (
                            <div className='flex items-center gap-1'>
                                <span><FaImage/></span>
                                {!conv?.lastMsg?.text && <span>Image</span>} 
                            </div>
                        )}
                        {conv?.lastMsg?.videoUrl && (
                            <div className='flex items-center gap-1'>
                                <span><FaVideo/></span>
                                {!conv?.lastMsg?.text && <span>Video</span>}
                            </div>
                        )}
                    </div>
                    <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                </div>
            </div>
            {Boolean(conv?.unseenMsg) && (
                <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-red-200 text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
            )}
        </NavLink>
    );
})

                    }          

        </div>
      </div>

      {/* Edit User Detail Section */}
      {editUserOpen && (
        <EditUserDetail onClose={() => setEditUserOpen(false)} data={user} />
      )}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
      {
        openLogout && (
          <Logout onClose={() => setOpenLogout(false)} />
        )
      }
    </div>
  );
};

export default Sidebar;
