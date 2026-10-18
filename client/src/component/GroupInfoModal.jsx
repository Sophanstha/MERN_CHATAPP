import React, { useState } from "react";
import { IoClose, IoExitOutline, IoPersonAddOutline } from "react-icons/io5";
import { FaCrown, FaUsers } from "react-icons/fa";
import Avatar from "./Avatar";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BACKEND_URL } from "../helper/apiUrl";

const GroupInfoModal = ({ group, onClose, onGroupUpdated }) => {
  const currentUser = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleLeaveGroup = async () => {
    if (!window.confirm(`Are you sure you want to leave ${group?.name}?`)) return;

    setLeaving(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/group/leave`,
        { groupId: group?._id },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("You left the group");
        onClose();
        navigate("/home");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to leave group");
    } finally {
      setLeaving(false);
    }
  };

  const adminId = group?.admin?._id || group?.admin;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Group Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer p-1"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Group Profile Info */}
        <div className="flex flex-col items-center py-4 border-b border-gray-100 dark:border-slate-700">
          {group?.profile_pic ? (
            <img
              src={group.profile_pic}
              alt={group.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-md mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner mb-2">
              <FaUsers size={36} />
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{group?.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {group?.members?.length || 0} participants
          </p>
        </div>

        {/* Member List */}
        <div className="py-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Members
          </h4>
          <div className="max-h-60 overflow-y-auto scrollbar flex flex-col gap-1.5">
            {group?.members?.map((member) => {
              const isMemberAdmin = member._id === adminId;
              const isMe = member._id === currentUser?._id;

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      width={36}
                      height={36}
                      name={member.name}
                      profile_pic={member.profile_pic}
                      userid={member._id}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                        {member.name} {isMe && "(You)"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>
                  {isMemberAdmin && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
                      <FaCrown size={10} />
                      Admin
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={handleLeaveGroup}
            disabled={leaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-900/50 rounded-xl transition-all cursor-pointer"
          >
            <IoExitOutline size={16} />
            {leaving ? "Leaving..." : "Leave Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
