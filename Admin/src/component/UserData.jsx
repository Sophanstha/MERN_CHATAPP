import React, { useEffect, useState } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserData = ({data}) => {
  const [userdata, setUserdatas] = useState([]);
  const url = "http://localhost:3000/api/Admin/getAlluser";
  const nav = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        if (!response || !response.data) {
          console.log("No data");
        } else {
          setUserdatas(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    };
    fetchData();
  }, []);

  const handleView = (id) => {
    // console.log("Viewing user:", user);
    // toast.info(`Viewing ${user.name}`);
    nav(`/viewuser/${id}`,{
      state: { userinfo :data}
    })
  };

  return (
    <div className="p-4 h-screen overflow-hidden">
      <h2 className="text-2xl font-semibold mb-4">User List</h2>

      {/* Scrollable Table Container */}
      <div className="overflow-y-auto h-[calc(100vh-150px)] border border-gray-300 rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Profile Picture</th>
              <th className="border border-gray-300 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {userdata.map((user, index) => (
              <tr key={user._id || index} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <img
                    src={user.profile_pic}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover mx-auto"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleView(user._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {userdata.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserData;
