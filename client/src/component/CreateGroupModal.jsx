import React, { useState, useEffect } from "react";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { FaUsers, FaCamera } from "react-icons/fa";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import uploadFile from "../helper/Uploadfile";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../helper/apiUrl";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const currentUser = useSelector((state) => state?.user);
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Search users to add to group
  useEffect(() => {
    const searchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${BACKEND_URL}/api/user/search`, {
          search: search,
        });
        // Filter out current user from search results
        const filtered = (response?.data?.data || []).filter(
          (u) => u._id !== currentUser?._id
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchUsers();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, currentUser?._id]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleMember = (user) => {
    const exists = selectedMembers.some((m) => m._id === user._id);
    if (exists) {
      setSelectedMembers((prev) => prev.filter((m) => m._id !== user._id));
    } else {
      setSelectedMembers((prev) => [...prev, user]);
    }
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Please enter a group name");
    }
    if (selectedMembers.length === 0) {
      return toast.error("Please select at least one member to add");
    }

    setCreating(true);
    let photoUrl = "";

    if (photo) {
      const uploadToast = toast.loading("Uploading group photo...");
      try {
        const uploaded = await uploadFile(photo);
        toast.dismiss(uploadToast);
        if (uploaded?.secure_url) {
          photoUrl = uploaded.secure_url;
        }
      } catch (err) {
        toast.dismiss(uploadToast);
        console.error("Group photo upload error:", err);
      }
    }

    try {
      const memberIds = selectedMembers.map((m) => m._id);
      const res = await axios.post(
        `${BACKEND_URL}/api/group/create`,
        {
          name: name.trim(),
          profile_pic: photoUrl,
          members: memberIds,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Group created successfully!");
        const newGroup = res.data.data;

        // Broadcast to group room via socket
        if (socketConnection) {
          socketConnection.emit("group-created", newGroup._id);
          socketConnection.emit("join-group", newGroup._id);
        }

        if (onGroupCreated) {
          onGroupCreated(newGroup);
        }

        onClose();
        navigate(`/home/group/${newGroup._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create group");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
              <FaUsers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create New Group</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connect with multiple friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <IoClose size={22} />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="mt-4 flex flex-col gap-4">
          {/* Group Photo & Name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <label
                htmlFor="groupPhoto"
                className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-teal-500 cursor-pointer overflow-hidden transition-colors"
                title="Upload group picture"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 dark:text-slate-400 flex flex-col items-center">
                    <FaCamera size={18} />
                    <span className="text-[9px] mt-1">Photo</span>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="groupPhoto"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="groupName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                id="groupName"
                placeholder="e.g. Study Group, Project Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-700/80 text-slate-800 dark:text-white rounded-xl border border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm transition-all"
                required
              />
            </div>
          </div>

          {/* Selected Members Chips */}
          {selectedMembers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Selected Members ({selectedMembers.length})
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar p-1.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-gray-200 dark:border-slate-700">
                {selectedMembers.map((m) => (
                  <span
                    key={m._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded-lg text-xs font-medium"
                  >
                    <span>{m.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(m._id)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <IoClose size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search Members */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Add Members *
            </label>
            <div className="relative flex items-center mb-2">
              <input
                type="text"
                placeholder="Search users to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700/80 text-slate-800 dark:text-white rounded-xl border border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none text-xs transition-all"
              />
              <IoSearchOutline size={16} className="absolute left-3 text-slate-400" />
            </div>

            {/* Member List */}
            <div className="max-h-48 overflow-y-auto scrollbar border border-gray-200 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-slate-800/80">
              {loading && (
                <div className="py-4 flex justify-center items-center">
                  <Loading />
                </div>
              )}
              {!loading && searchResults.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  {search ? "No users found" : "Type to search users"}
                </p>
              )}
              {!loading &&
                searchResults.map((user) => {
                  const isSelected = selectedMembers.some((m) => m._id === user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleMember(user)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          width={34}
                          height={34}
                          name={user.name}
                          profile_pic={user.profile_pic}
                          userid={user._id}
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
