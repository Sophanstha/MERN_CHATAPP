import React, { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import uploadFile from '../helper/Uploadfile'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch } from "react-redux";
import { setUser as setUsers } from '../redux/UserSlice'
const EditUserDetail = ({onClose,data}) => {
    const [user,setUser] = useState({
        name : data?.name,
        profile_pic : data?.profile_pic
    })
    const usedispatch = useDispatch();
    const uploadPhotoRef = useRef()
    const urls = "http://localhost:3000/api/user/updateuser";

    useEffect(()=>{
        setUser((preve)=>{
            return{
                ...preve,
                name : data?.name,
                profile_pic : data?.profile_pic
                //...user
            }
        })
    },[data])    

    const handleChnageName =(e)=>{
        e.preventDefault();
        const {name,value} = e.target ;
        setUser((prev)=>{
            return{
                ...prev,
                [name] : value
            }
        })
    }
    const handleOpenUploadPhoto = (e)=>{
        e.preventDefault()
        e.stopPropagation()
        uploadPhotoRef.current.click()
    }

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
    
        try {
            const uploadPhoto = await uploadFile(file);
            console.log("Upload successful:", uploadPhoto?.url);
    
            setUser((prev) => ({
                ...prev,
                profile_pic: uploadPhoto?.url,
            }));
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };
    const handleSubmit = async(e)=>{
        e.preventDefault()
        e.stopPropagation()
        console.log("hello i am submit");
        
        const response = await axios.patch(urls,{
            name : user.name,
            profile_pic : user.profile_pic
        },
    {
        withCredentials:true
    });
        if(response?.data?.success){
            // usedispatch(setUser(response?.data?.data))
            usedispatch(setUsers({
                _id: response?.data?.data?._id || "",  // Ensure a valid ID
                name: response?.data?.data?.name || "", 
                email: response?.data?.data?.email || "", 
                profile_pic: response?.data?.data?.profile_pic || ""
            }));
            
            toast.success(response?.data?.message)
            onClose()
        }
        else{
            toast.error(response?.data?.message)
        }
    }
    return (
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10'>
    <div className='bg-white p-4 py-6 m-1 rounded w-full max-w-sm'>
        <h2 className='font-semibold'>Profile Details</h2>
        <p className='text-sm '>Edit user details</p>

        <form className='grid gap-3 mt-3' >
            <div className='flex flex-col gap-1'>
                <label htmlFor='name'>Name:</label>
                <input
                    type='text'
                    name='name'
                    id='name'
                    value={user?.name}
                    onChange={handleChnageName}
                 
                    className='w-full py-1 px-2 focus:outline-primary border-0.5'
                />
            </div>
            <div>
                    <div>Photo:</div>
                    <div className='my-1 flex items-center gap-4'>
                        <Avatar
                            width={40}
                            height={40}
                            profile_pic={user?.profile_pic}
                            name={user?.name}
                        />
                        <label htmlFor='profile_pic'>
                        <button className='font-semibold' onClick={handleOpenUploadPhoto}>Change Photo</button>
                        <input
                            type='file'
                            id='profile_pic'
                            className='hidden'
                            onChange={handleUploadPhoto}
                            ref={uploadPhotoRef}
                        />
                        </label>
                    </div>
                </div>
            
 
            <div className='flex gap-2 w-fit ml-auto '>
                    <button onClick={onClose}  className='border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white'>Cancel</button>
                    <button 
                    onClick={handleSubmit}
                    className='border-2 border-red-500 bg-primary px-4 py-1 rounded text-black'>Save</button>

                </div>
        </form>
    </div>
</div>
  )
}

export default EditUserDetail