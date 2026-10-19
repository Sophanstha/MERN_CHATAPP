import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../helper/apiUrl';

const AdminDetail = () => {
  const [admins, setAdmins] = useState([]);
  const url = `${BACKEND_URL}/api/Admin/getAllAdmin`;

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(url);
        if (response?.data) {
          setAdmins(response.data);
        } else {
          console.log("No data");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    };

    fetchAdmins();
  }, []);

  const handleView = (admin) => {
    console.log("Viewing admin:", admin);
    toast.info(`Viewing ${admin.name}`);
  };

  return (
    <div className="p-4 h-screen overflow-hidden">
      <h2 className="text-2xl font-semibold mb-4">Admin List</h2>

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
            {admins.map((admin, index) => (
              <tr key={admin._id || index} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{admin.name}</td>
                <td className="border border-gray-300 px-4 py-2">{admin.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <img
                    src={admin.profile_pic}
                    alt={admin.name}
                    className="w-12 h-12 rounded-full object-cover mx-auto"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleView(admin)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDetail;
