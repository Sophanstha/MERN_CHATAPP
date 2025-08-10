// SideBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
const SideBar = ({ data, onSectionChange }) => {
  const handleLogout = () => {
    console.log('Logging out...');
  };
  const navigate = useNavigate();
  

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col justify-between">
      <div>
        <div className="flex flex-col items-center mb-8">
          <img
            src={data?.profile_pic}
            alt="Admin"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
          <h2 className="text-lg font-semibold">{data?.name || 'Admin Name'}</h2>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSectionChange('users')}
            className="bg-blue-600 hover:bg-blue-700 py-2 rounded"
          >
            All Users
          </button>
          <button
            onClick={() => onSectionChange('admins')}
            className="bg-green-600 hover:bg-green-700 py-2 rounded"
          >
            All Admins
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
