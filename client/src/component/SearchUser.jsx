import React, { useEffect, useState } from 'react'
import { IoClose, IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserCard';
import axios from 'axios';
import toast from 'react-hot-toast';
const SearchUser = ({onClose}) => {
    const URL = "http://localhost:3000/api/user/search";
    const [searchUser,setSearchUser]= useState([]);
    const [loading,setLoading] = useState(false);
    const [search,setSearch] = useState("");

    const handleSearch =async ()=>{
       setLoading(true);
        try {
             const response =await axios.post(URL,{
                 search : search
             }
             )
             setLoading(false)
             setSearchUser(response.data?.data);
       } catch (error) {
        toast.error(error?.response?.data?.message)
        
       }
    }

    useEffect(()=>{
        handleSearch();
    },[search])
    console.log("serachUser",searchUser);
    

  return (
    <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs p-4 z-50 flex flex-col items-center justify-start pt-16'>
      <div className='w-full max-w-lg mx-auto relative'>
        {/* Input search user */}
        <div className='bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl h-14 overflow-hidden flex items-center shadow-2xl transition-colors'>
          <input 
            type='text'
            placeholder='Search user by name, email...'
            className='w-full outline-none py-1 h-full px-5 text-slate-800 dark:text-white bg-transparent placeholder:text-gray-400 text-sm'
            onChange={(e) => setSearch(e.target.value)} 
            value={search}
            autoFocus
          />
          <div className='h-14 w-14 flex justify-center items-center text-slate-400 dark:text-slate-500'>
            <IoSearchOutline size={22}/>
          </div>
        </div>

        {/* Search Results */}
        <div className='bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 mt-3 w-full p-3 rounded-2xl max-h-[65vh] overflow-y-auto scrollbar shadow-2xl transition-colors'>
          {searchUser.length === 0 && !loading && (
            <p className='text-center py-6 text-sm text-slate-400 dark:text-slate-500'>
              {search ? "No user found with that query." : "Type a name or email to search."}
            </p>
          )}
          {loading && (
            <div className='py-6 flex justify-center items-center'>
              <Loading/>
            </div>
          )}
          {searchUser.length !== 0 && !loading && (
            searchUser.map((u) => (
              <UserSearchCard 
                key={u._id}
                user={u}
                onClose={onClose}
              />   
            ))
          )}
        </div>

        {/* Close Button */}
        <button 
          className='absolute -top-12 right-0 text-white/80 hover:text-white text-3xl cursor-pointer p-1 transition-colors'
          onClick={onClose}
          title="Close search"
        >
          <IoClose size={28}/>
        </button>
      </div>
    </div>
  );
}

export default SearchUser