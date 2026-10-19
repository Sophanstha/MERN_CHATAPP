import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import UserData from './UserData';
import AdminDetail from './AdminDetail';

const DashBoard = () => {
  const nav = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(() => {
    if (location.state?.data) return location.state.data;
    if (location.state?.userinfo) return location.state.userinfo;
    try {
      const saved = localStorage.getItem('adminUser');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [section, setSection] = useState('users'); // default section

  useEffect(() => {
    if (location.state?.data) {
      setData(location.state.data);
      localStorage.setItem('adminUser', JSON.stringify(location.state.data));
    } else if (location.state?.userinfo) {
      setData(location.state.userinfo);
      localStorage.setItem('adminUser', JSON.stringify(location.state.userinfo));
    } else {
      const saved = localStorage.getItem('adminUser');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?._id) {
            setData(parsed);
          } else {
            nav('/');
          }
        } catch (e) {
          nav('/');
        }
      } else {
        nav('/');
      }
    }
  }, [location.state, nav]);

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
