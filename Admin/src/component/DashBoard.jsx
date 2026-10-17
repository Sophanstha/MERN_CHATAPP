import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import UserData from './UserData';
import AdminDetail from './AdminDetail';
import Cookies from 'js-cookie'; // import js-cookie
const DashBoard = () => {
  const nav = useNavigate();
  const location = useLocation();
  const data = location.state?.data || location.state?.userinfo;
  const [section, setSection] = useState('users'); // default section

  // Check for cookie (e.g., auth token) on mount
  useEffect(() => {
    if (!data) {
      nav('/');
    }
  }, [data, nav]);

  return (
    <div className="flex min-h-screen">
      <div className="w-1/4 bg-gray-100">
        <SideBar data={data} onSectionChange={setSection} />
      </div>

      <div className="w-3/4 p-4">
        {section === 'users' && <UserData data={data} />}
        {section === 'admins' && <AdminDetail />}
      </div>
    </div>
  );
};

export default DashBoard;
