import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../helper/apiUrl';

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const location = useLocation();
  const datas = location.state?.userinfo;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Admin/singleinfo/${id}`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to load user data");
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/Admin/deleteuser/${id}`);
      toast.success("User deleted successfully");
      navigate('/dashboard',{
        state: { userinfo: datas }
      }); // Redirect to users list after deletion
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    }
    setShowDeleteModal(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-amber-200 rounded-full mb-4"></div>
        <div className="h-4 bg-amber-200 rounded w-32"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-amber-800 mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Main User Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10 transition-all duration-300 hover:shadow-xl relative">
          {/* Delete Button */}
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-1 bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete User</span>
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-3xl font-bold text-amber-800 mb-6">User Profile</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <img 
                  src={data?.user?.profile_pic || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full border-4 border-amber-200 shadow-md"
                />
              </div>
              <div className="flex-1">
                <table className="w-full">
                  <tbody className="divide-y divide-amber-100">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-amber-700">Name</td>
                      <td className="py-3 px-4">{data?.user?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-amber-700">Email</td>
                      <td className="py-3 px-4">{data?.user?.email || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Users Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-amber-800 mb-6">Connected Users</h3>
            
            {data?.contacts?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.contacts.map((contact) => (
                  <div 
                    key={contact._id} 
                    className="bg-amber-50 rounded-lg p-4 border border-amber-100 transition-all duration-300 hover:bg-amber-100 hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex-shrink-0">
                        <img 
                          src={contact?.profile_pic || 'https://via.placeholder.com/150'} 
                          alt="Contact Profile" 
                          className="w-16 h-16 rounded-full border-2 border-amber-200 object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-900">{contact?.name}</h4>
                        <p className="text-sm text-amber-700">{contact?.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-amber-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-amber-600 font-medium">No contacts found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;