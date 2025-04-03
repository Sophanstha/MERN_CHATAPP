import React from 'react'
import { FaUserAstronaut } from "react-icons/fa";
import { useSelector } from 'react-redux';

const Avatar = ({ userid, name, profile_pic, width, height }) => {
  const onLineUser = useSelector((state)=> state?.user?.onlineUser )
let avatarname= "";
if(name){
    const sliptname = name?.split(" ");
    if(sliptname.length > 1){
        avatarname = sliptname[0][0] + sliptname[1][0];

    }else{
        avatarname = sliptname[0][0];
    }

}
const bgColor = [
    'bg-slate-200',
    'bg-teal-200',
    'bg-red-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-gray-200',
    "bg-cyan-200",
    "bg-sky-200",
    "bg-blue-200"
  ]

  const randomNumber = Math.floor(Math.random() * 9)
  const isOnline = onLineUser.includes(userid)
  // console.log(isOnline);
  
    return (
    // <div>
    <div className={`text-slate-800 z-0 rounded-full font-bold relative overflow-hidden ${bgColor[randomNumber]}`} style={{width : width+"px", height : height+"px" }}>
    {profile_pic ? (
        <img 
          src={profile_pic} 
          alt={name || "User Avatar"} 
          width={width} 
          height={height} 
        />
      ) : (
        name ? (
            <div  style={{width : width+"px", height : height+"px", fontSize:"30px" }} className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}}`}>
                    {avatarname}
            </div>
        ) : (
          <FaUserAstronaut title="Default Avatar" 
       style={{width:100,height:100,color:'green'}}   
          />
        )
      )}

      
{
          isOnline && (
            <div className='bg-green-700 w-2.5 h-2.5 p-1 absolute bottom-1 left-1.5 z-10 rounded-full'></div>
          )
        }
    </div>
  );
}

export default Avatar;
