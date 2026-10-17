import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'

const UserSearchCard = ({user, onClose}) => {
  return (
    <Link
      to={"/home/" + user?._id}
      onClick={onClose}
      className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors"
    >
      <div>
        <Avatar
          width={46}
          height={46}
          userid={user?._id}
          name={user?.name}
          profile_pic={user?.profile_pic}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
          {user?.name}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
      </div>
    </Link>
  );
}

export default UserSearchCard
