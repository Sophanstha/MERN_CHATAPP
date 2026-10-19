import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { FiArrowUpLeft } from "react-icons/fi";
import { FaImage, FaVideo } from "react-icons/fa6";
import { MdGroupAdd } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import Avatar from "./Avatar";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import EditUserDetail from "./EditUserDetail";
import SearchUser from "./SearchUser";
import Logout from "./Logout";
import ThemeToggle from "./ThemeToggle";
import CreateGroupModal from "./CreateGroupModal";
import axios from "axios";
import { BACKEND_URL } from "../helper/apiUrl";

const Sidebar = () => {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  const [allUser, setAllUser] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'direct' | 'groups' | 'ai'
  const [aiLastMsg, setAiLastMsg] = useState("");

  const socketConnection = useSelector((state) => state?.user?.socketConnection);

  // Format and set conversation items ensuring string ID matching
  const formatAndSetConversations = (data) => {
    const currentUserId = user?._id?.toString();
    const conversionUserData = data?.map((uconv) => {
      const senderId = uconv?.sender?._id?.toString();
      const receiverId = uconv?.receiver?._id?.toString();

      if (senderId === receiverId) {
        return {
          ...uconv,
          userDetails: uconv?.sender,
        };
      } else if (receiverId !== currentUserId) {
        return {
          ...uconv,
          userDetails: uconv?.receiver,
        };
      } else {
        return {
          ...uconv,
          userDetails: uconv?.sender,
        };
      }
    });
    setAllUser(conversionUserData || []);
  };

  // HTTP fallback to fetch conversations immediately on load
  const fetchMyConversations = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/conversations`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        formatAndSetConversations(res.data.data || []);
      }
    } catch (e) {
      console.error("Error fetching conversations via HTTP:", e);
    }
  };

  // Fetch 1-to-1 conversations via socket
  useEffect(() => {
    if (socketConnection) {
      const requestSidebar = () => {
        if (user?._id) {
          socketConnection.emit("sidebar", user._id);
        }
      };

      if (user?._id) {
        requestSidebar();
        socketConnection.on("connect", requestSidebar);
      }

      socketConnection.on("conversion", formatAndSetConversations);
      socketConnection.on("conversation", formatAndSetConversations);

      return () => {
        socketConnection.off("connect", requestSidebar);
        socketConnection.off("conversion", formatAndSetConversations);
        socketConnection.off("conversation", formatAndSetConversations);
      };
    }
  }, [socketConnection, user?._id]);

  // Fetch User Groups
  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/group/my-groups`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setGroups(res.data.data || []);
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
  };

  // Fetch AI conversation preview
  const fetchAiPreview = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ai/history`, {
        withCredentials: true,
      });
      if (res.data?.success && res.data.data?.length > 0) {
        const last = res.data.data[res.data.data.length - 1];
        setAiLastMsg(last?.text || "");
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMyConversations();
      fetchMyGroups();
      fetchAiPreview();
    }
  }, [user?._id]);

  // Socket listeners for group updates
  useEffect(() => {
    if (socketConnection) {
      const handleGroupUpdate = (data) => {
        setGroups((prev) =>
          prev.map((g) =>
            g._id === data.groupId
              ? { ...g, lastMsg: data.lastMsg, updatedAt: data.updatedAt || new Date() }
              : g
          )
        );
      };

      const handleNewGroupAdded = (newGroup) => {
        setGroups((prev) => {
          const exists = prev.some((g) => g._id === newGroup._id);
          if (exists) return prev;
          return [newGroup, ...prev];
        });
      };

      socketConnection.on("group-sidebar-update", handleGroupUpdate);
      socketConnection.on("new-group-added", handleNewGroupAdded);

      return () => {
        socketConnection.off("group-sidebar-update", handleGroupUpdate);
        socketConnection.off("new-group-added", handleNewGroupAdded);
      };
    }
  }, [socketConnection]);

  // Prepare combined items based on activeTab
  const combinedList = () => {
    let items = [];

    if (activeTab === "all" || activeTab === "direct") {
      const directItems = allUser.map((conv) => ({
        ...conv,
        type: "direct",
        timestamp: conv?.lastMsg?.createdAt || 0,
      }));
      items = [...items, ...directItems];
    }

    if (activeTab === "all" || activeTab === "groups") {
      const groupItems = groups.map((g) => ({
        ...g,
        type: "group",
        timestamp: g?.lastMsg?.createdAt || g?.updatedAt || 0,
      }));
      items = [...items, ...groupItems];
    }

    // Sort by most recent activity
    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const currentItems = combinedList();

  return (
    <div className="w-full h-full flex bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-colors duration-200">
      {/* Mini Icon Bar */}
      <div className="bg-slate-100 dark:bg-slate-950 w-14 h-full py-5 text-slate-600 dark:text-slate-300 flex flex-col justify-between items-center border-r border-gray-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              `w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors ${
                isActive ? "bg-slate-200 dark:bg-slate-800 text-teal-600 dark:text-teal-400" : ""
              }`
            }
            title="Chat"
          >
            <IoChatbubbleEllipses size={22} />
          </NavLink>
          <NavLink
            to="/home/ai"
            className={({ isActive }) =>
              `w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all relative ${
                isActive
                  ? "bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30"
                  : "text-slate-600 dark:text-slate-300"
              }`
            }
            title="Gemini AI Assistant"
          >
            <HiSparkles size={20} className="text-teal-600 dark:text-teal-400" />
          </NavLink>
          <button
            className="w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Add Friend"
            onClick={() => setOpenSearchUser(true)}
          >
            <FaUserPlus size={20} />
          </button>
          <button
            className="w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Create Group"
            onClick={() => setOpenCreateGroup(true)}
          >
            <MdGroupAdd size={22} />
          </button>

          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <ThemeToggle className="w-9 h-9" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            className="cursor-pointer hover:opacity-80 transition-opacity"
            title={user?.name || "Profile"}
            onClick={() => setEditUserOpen(true)}
          >
            <Avatar
              width={38}
              height={38}
              userid={user?._id}
              name={user?.name}
              profile_pic={user?.profile_pic}
            />
          </button>
          <button
            onClick={() => setOpenLogout(true)}
            title="Logout"
            className="w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-500 rounded-xl transition-colors"
          >
            <BiLogOut size={22} />
          </button>
        </div>
      </div>

      {/* Conversations List Section */}
      <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden transition-colors">
        {/* Header & New Group Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Messages</h2>
          <button
            onClick={() => setOpenCreateGroup(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            title="Create a new group"
          >
            <MdGroupAdd size={16} />
            <span>New Group</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pt-2 pb-1 flex gap-1.5 border-b border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === "all"
                ? "bg-teal-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("direct")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === "direct"
                ? "bg-teal-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === "groups"
                ? "bg-teal-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Groups</span>
            {groups.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-800 dark:bg-teal-300 dark:text-slate-900 text-white">
                {groups.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === "ai"
                ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <HiSparkles size={13} className={activeTab === "ai" ? "text-white" : "text-teal-500"} />
            <span>AI Bot</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar px-2 py-2">
          {/* Pinned Gemini AI Assistant Item */}
          {(activeTab === "all" || activeTab === "direct" || activeTab === "ai") && (
            <NavLink
              to="/home/ai"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2.5 my-1 rounded-xl transition-all cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-teal-50/90 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/80 border-l-4 border-teal-500 shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`
              }
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <HiSparkles size={20} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                    <span>Gemini AI</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-medium">
                      AI Bot
                    </span>
                  </h3>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    Online
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-0.5">
                  {aiLastMsg || "Ask anything with Gemini AI..."}
                </p>
              </div>
            </NavLink>
          )}

          {currentItems.length === 0 && activeTab !== "ai" && (
            <div className="mt-12 text-center px-4">
              <div className="flex justify-center items-center my-4 text-slate-400 dark:text-slate-500">
                <FiArrowUpLeft size={44} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {activeTab === "groups"
                  ? "No groups yet. Click 'New Group' to create one!"
                  : "Explore users or create a group to start a conversation."}
              </p>
            </div>
          )}

          {currentItems.map((item) => {
            const isGroup = item.type === "group";

            if (isGroup) {
              return (
                <NavLink
                  to={`/home/group/${item._id}`}
                  key={`group-${item._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 my-1 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-teal-50 dark:bg-slate-800 border-l-4 border-teal-500 shadow-sm"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`
                  }
                >
                  <div className="flex-shrink-0">
                    {item.profile_pic ? (
                      <img
                        src={item.profile_pic}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <FaUsers size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-md font-medium">
                        Group
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      {item.lastMsg?.imageUrl && (
                        <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                          <FaImage size={12} />
                          {!item.lastMsg?.text && <span>Image</span>}
                        </span>
                      )}
                      {item.lastMsg?.videoUrl && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <FaVideo size={12} />
                          {!item.lastMsg?.text && <span>Video</span>}
                        </span>
                      )}
                      <p className="truncate">
                        {item.lastMsg?.msgByUserId?.name
                          ? `${item.lastMsg.msgByUserId.name}: ${item.lastMsg.text || ""}`
                          : item.lastMsg?.text || `${item.members?.length || 0} members`}
                      </p>
                    </div>
                  </div>
                </NavLink>
              );
            }

            // Direct 1-on-1 chat item
            return (
              <NavLink
                to={`/home/${item?.userDetails?._id}`}
                key={`direct-${item?._id}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2.5 my-1 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-teal-50 dark:bg-slate-800 border-l-4 border-teal-500 shadow-sm"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`
                }
              >
                <div className="flex-shrink-0">
                  <Avatar
                    profile_pic={item?.userDetails?.profile_pic}
                    name={item?.userDetails?.name}
                    width={40}
                    height={40}
                    userid={item?.userDetails?._id}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {item?.userDetails?.name}
                  </h3>
                  <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    {item?.lastMsg?.imageUrl && (
                      <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                        <FaImage size={12} />
                        {!item?.lastMsg?.text && <span>Image</span>}
                      </span>
                    )}
                    {item?.lastMsg?.videoUrl && (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <FaVideo size={12} />
                        {!item?.lastMsg?.text && <span>Video</span>}
                      </span>
                    )}
                    <p className="truncate">{item?.lastMsg?.text}</p>
                  </div>
                </div>
                {Boolean(item?.unseenMsg) && (
                  <span className="text-xs min-w-5 h-5 px-1.5 flex justify-center items-center bg-teal-600 text-white font-bold rounded-full shadow-sm">
                    {item?.unseenMsg}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {editUserOpen && (
        <EditUserDetail onClose={() => setEditUserOpen(false)} data={user} />
      )}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
      {openCreateGroup && (
        <CreateGroupModal
          onClose={() => setOpenCreateGroup(false)}
          onGroupCreated={(newGroup) => {
            setGroups((prev) => [newGroup, ...prev]);
          }}
        />
      )}
      {openLogout && (
        <Logout onClose={() => setOpenLogout(false)} />
      )}
    </div>
  );
};

export default Sidebar;
