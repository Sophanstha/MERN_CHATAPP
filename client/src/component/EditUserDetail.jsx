import React, { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import uploadFile from '../helper/Uploadfile'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch } from "react-redux";
import { setUser as setUsers } from '../redux/UserSlice'
import { BACKEND_URL } from '../helper/apiUrl';

const EditUserDetail = ({onClose,data}) => {
    const [user,setUser] = useState({
        name : data?.name,
        profile_pic : data?.profile_pic
    })
    const usedispatch = useDispatch();
    const uploadPhotoRef = useRef()
    const urls = `${BACKEND_URL}/api/user/updateuser`;

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
        // console.log("hello i am submit");
        
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
      <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4'>
        <div className='bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-slate-800 dark:text-slate-100 transition-colors'>
          <h2 className='font-bold text-lg text-slate-800 dark:text-white'>Profile Details</h2>
          <p className='text-xs text-slate-500 dark:text-slate-400'>Edit your profile information</p>

          <form className='grid gap-4 mt-4'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='name' className='font-medium text-xs text-slate-700 dark:text-slate-300'>Name:</label>
              <input
                type='text'
                name='name'
                id='name'
                value={user?.name || ""}
                onChange={handleChnageName}
                className='w-full py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-slate-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none text-sm transition-all'
              />
            </div>
            <div>
              <div className='font-medium text-xs text-slate-700 dark:text-slate-300 mb-1.5'>Photo:</div>
              <div className='my-1 flex items-center gap-4'>
                <Avatar
                  width={46}
                  height={46}
                  profile_pic={user?.profile_pic}
                  name={user?.name}
                />
                <button
                  type="button"
                  className='text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 cursor-pointer transition-colors'
                  onClick={handleOpenUploadPhoto}
                >
                  Change Photo
                </button>
                <input
                  type='file'
                  id='profile_pic'
                  className='hidden'
                  onChange={handleUploadPhoto}
                  ref={uploadPhotoRef}
                  accept="image/*"
                />
              </div>
            </div>

            <div className='flex gap-2 w-fit ml-auto mt-2'>
              <button
                type="button"
                onClick={onClose}
                className='px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors'
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className='px-5 py-2 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow cursor-pointer transition-all'
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}

export default EditUserDetail