import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { FaAngleLeft, FaPlus, FaImage, FaVideo, FaUsers, FaPlay } from "react-icons/fa6";
import { FiMaximize2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import Avatar from "./Avatar";
import uploadFile from "../helper/Uploadfile";
import Loading from "./Loading";
import GroupInfoModal from "./GroupInfoModal";
import MediaModal from "./MediaModal";

const GroupMessage = () => {
  const { groupId } = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);

  const [groupData, setGroupData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Collect all media messages for gallery browsing in group
  const mediaList = useMemo(() => {
    const list = [];
    allMessages?.forEach((msg) => {
      const senderName =
        typeof msg.msgByUserId === "object"
          ? msg.msgByUserId?.name
          : groupData?.members?.find((m) => m._id === msg.msgByUserId)?.name;

      if (msg?.imageUrl) {
        list.push({
          url: msg.imageUrl,
          type: "image",
          text: msg.text,
          createdAt: msg.createdAt,
          sender: senderName,
          _id: msg._id,
        });
      }
      if (msg?.videoUrl) {
        list.push({
          url: msg.videoUrl,
          type: "video",
          text: msg.text,
          createdAt: msg.createdAt,
          sender: senderName,
          _id: msg._id,
        });
      }
    });
    return list;
  }, [allMessages, groupData]);

  const handleOpenMedia = (mediaItem) => {
    const index = mediaList.findIndex((m) => m.url === mediaItem.url);
    if (index !== -1) {
      setCurrentMediaIndex(index);
      setSelectedMedia(mediaList[index]);
    } else {
      setCurrentMediaIndex(0);
      setSelectedMedia(mediaItem);
    }
    setIsMediaModalOpen(true);
  };

  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });

  const currentMessage = useRef(null);

  // Load group and listen to socket
  useEffect(() => {
    if (socketConnection && groupId) {
      const requestGroupData = () => {
        socketConnection.emit("group-page", groupId);
      };

      const handleGroupData = (data) => {
        setGroupData(data);
      };

      const handleGroupMessages = (msgs) => {
        setAllMessages(msgs || []);
      };

      const handleNewMessage = (newMsg) => {
        setAllMessages((prev) => [...prev, newMsg]);
      };

      socketConnection.on("group-data", handleGroupData);
      socketConnection.on("group-messages", handleGroupMessages);
      socketConnection.on("group-message", handleNewMessage);

      // Request group data immediately
      requestGroupData();

      // In case socket is currently connecting or reconnects after refresh
      socketConnection.on("connect", requestGroupData);

      return () => {
        socketConnection.off("group-data", handleGroupData);
        socketConnection.off("group-messages", handleGroupMessages);
        socketConnection.off("group-message", handleNewMessage);
        socketConnection.off("connect", requestGroupData);
      };
    }
  }, [socketConnection, groupId]);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessages]);

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const res = await uploadFile(file);
    setLoading(false);
    if (res?.url) {
      setMessage((prev) => ({ ...prev, imageUrl: res.url }));
    }
    setShowAttachMenu(false);
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const res = await uploadFile(file);
    setLoading(false);
    if (res?.url) {
      setMessage((prev) => ({ ...prev, videoUrl: res.url }));
    }
    setShowAttachMenu(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.text.trim() && !message.imageUrl && !message.videoUrl) return;

    if (socketConnection) {
      socketConnection.emit("new-group-message", {
        groupId: groupId,
        sender: user?._id,
        text: message.text,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
      });

      setMessage({
        text: "",
        imageUrl: "",
        videoUrl: "",
      });
    }
  };

  const memberNamesPreview = groupData?.members
    ?.map((m) => (m._id === user._id ? "You" : m.name?.split(" ")[0]))
    .join(", ");

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center px-4 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/home" className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-teal-600">
            <FaAngleLeft size={24} />
          </Link>

          <div
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            {groupData?.profile_pic ? (
              <img
                src={groupData.profile_pic}
                alt={groupData.name}
                className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner flex-shrink-0">
                <FaUsers size={22} />
              </div>
            )}

            <div className="min-w-0 truncate">
              <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {groupData?.name || "Loading group..."}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">
                {memberNamesPreview || `${groupData?.members?.length || 0} members`}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowInfoModal(true)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Group info"
        >
          <HiDotsVertical size={18} />
        </button>
      </header>

      {/* Messages Feed */}
      <section className="flex-1 overflow-x-hidden overflow-y-auto scrollbar relative bg-slate-100/60 dark:bg-slate-950 p-4 transition-colors">
        <div className="flex flex-col gap-3 max-w-4xl mx-auto" ref={currentMessage}>
          {allMessages.map((msg, index) => {
            const senderId =
              typeof msg?.msgByUserId === "object"
                ? msg.msgByUserId?._id
                : msg?.msgByUserId;
            const isMe = user?._id === senderId;
            const senderObj =
              typeof msg?.msgByUserId === "object" ? msg.msgByUserId : null;

            return (
              <div
                key={msg?._id || index}
                className={`flex gap-2 max-w-[290px] sm:max-w-md md:max-w-lg ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {!isMe && (
                  <div className="flex-shrink-0 mt-1">
                    <Avatar
                      width={30}
                      height={30}
                      name={senderObj?.name || "User"}
                      profile_pic={senderObj?.profile_pic}
                      userid={senderId}
                    />
                  </div>
                )}

                <div
                  className={`p-2.5 rounded-2xl shadow-sm transition-all ${
                    isMe
                      ? "bg-teal-600 text-white rounded-tr-xs"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-gray-100 dark:border-slate-700/60"
                  }`}
                >
                  {/* Sender Name in Group */}
                  {!isMe && (
                    <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-1">
                      {senderObj?.name || "Member"}
                    </p>
                  )}

                  {/* Media Content */}
                  {msg?.imageUrl && (
                    <div
                      onClick={() =>
                        handleOpenMedia({
                          url: msg.imageUrl,
                          type: "image",
                          text: msg.text,
                          createdAt: msg.createdAt,
                          sender: senderObj?.name,
                        })
                      }
                      className="group relative cursor-pointer overflow-hidden rounded-lg mb-1.5"
                      title="Click to view full screen"
                    >
                      <img
                        src={msg.imageUrl}
                        alt="Shared media"
                        className="max-h-64 sm:max-h-80 w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100 bg-black/60 backdrop-blur-xs text-white p-2.5 rounded-full shadow-lg">
                          <FiMaximize2 size={18} />
                        </div>
                      </div>
                    </div>
                  )}
                  {msg?.videoUrl && (
                    <div
                      onClick={() =>
                        handleOpenMedia({
                          url: msg.videoUrl,
                          type: "video",
                          text: msg.text,
                          createdAt: msg.createdAt,
                          sender: senderObj?.name,
                        })
                      }
                      className="group relative cursor-pointer overflow-hidden rounded-lg mb-1.5 bg-black/40"
                      title="Click to view full screen"
                    >
                      <video
                        src={msg.videoUrl}
                        className="max-h-64 sm:max-h-80 w-full object-cover rounded-lg"
                        preload="metadata"
                      />
                      {/* Sleek Play & Fullscreen overlay */}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-teal-600/90 group-hover:bg-teal-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-200 pl-0.5">
                          <FaPlay size={16} />
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <FiMaximize2 size={12} />
                          <span>Full screen</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.text && (
                    <p className="text-sm font-normal px-1 leading-relaxed break-words">
                      {msg.text}
                    </p>
                  )}

                  {/* Timestamp */}
                  <p
                    className={`text-[10px] mt-1 text-right w-full ${
                      isMe ? "text-teal-100" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {moment(msg.createdAt).format("hh:mm A")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload previews */}
        {message?.imageUrl && (
          <div className="w-full sticky bottom-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center rounded-xl p-3 my-2 z-10">
            <div className="relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg group">
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full cursor-pointer transition-colors z-10"
                onClick={() => setMessage((prev) => ({ ...prev, imageUrl: "" }))}
              >
                <IoClose size={18} />
              </button>
              <div
                onClick={() =>
                  handleOpenMedia({
                    url: message.imageUrl,
                    type: "image",
                    text: message.text,
                  })
                }
                className="cursor-pointer relative overflow-hidden rounded-lg"
                title="Click to view full screen"
              >
                <img
                  src={message.imageUrl}
                  alt="Upload preview"
                  className="aspect-square w-48 h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/60 text-white p-2 rounded-full transition-opacity">
                    <FiMaximize2 size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {message?.videoUrl && (
          <div className="w-full sticky bottom-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center rounded-xl p-3 my-2 z-10">
            <div className="relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg group">
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full cursor-pointer transition-colors z-10"
                onClick={() => setMessage((prev) => ({ ...prev, videoUrl: "" }))}
              >
                <IoClose size={18} />
              </button>
              <div
                onClick={() =>
                  handleOpenMedia({
                    url: message.videoUrl,
                    type: "video",
                    text: message.text,
                  })
                }
                className="cursor-pointer relative overflow-hidden rounded-lg"
                title="Click to view full screen"
              >
                <video
                  src={message.videoUrl}
                  className="aspect-square w-48 h-48 object-cover rounded-lg"
                  muted
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg pl-0.5 group-hover:scale-110 transition-transform">
                    <FaPlay size={14} />
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <FiMaximize2 size={11} />
                    <span>Full screen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="w-full flex justify-center items-center py-4">
            <Loading />
          </div>
        )}
      </section>

      {/* Input Section */}
      <section className="h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center px-4 gap-2 transition-colors">
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu((prev) => !prev)}
            type="button"
            className="flex justify-center items-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            title="Attach media"
          >
            <FaPlus size={18} />
          </button>

          {showAttachMenu && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl absolute bottom-14 left-0 w-40 p-2 text-slate-700 dark:text-slate-200 z-20">
              <form>
                <label
                  htmlFor="groupUploadImage"
                  className="flex items-center p-2 gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <FaImage size={18} className="text-teal-500" />
                  <span className="text-sm font-medium">Image</span>
                </label>
                <label
                  htmlFor="groupUploadVideo"
                  className="flex items-center p-2 gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <FaVideo size={18} className="text-purple-500" />
                  <span className="text-sm font-medium">Video</span>
                </label>

                <input
                  type="file"
                  id="groupUploadImage"
                  onChange={handleUploadImage}
                  className="hidden"
                  accept="image/*"
                />
                <input
                  type="file"
                  id="groupUploadVideo"
                  onChange={handleUploadVideo}
                  className="hidden"
                  accept="video/*"
                />
              </form>
            </div>
          )}
        </div>

        <form className="h-full flex-1 flex items-center gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a group message..."
            className="flex-1 bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2.5 px-4 rounded-full outline-none border border-transparent focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
            value={message.text}
            onChange={(e) => setMessage((prev) => ({ ...prev, text: e.target.value }))}
          />
          <button
            type="submit"
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded-full cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
            title="Send"
          >
            <IoMdSend size={24} />
          </button>
        </form>
      </section>

      {/* Info Modal */}
      {showInfoModal && (
        <GroupInfoModal group={groupData} onClose={() => setShowInfoModal(false)} />
      )}

      {/* Full-screen Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        media={selectedMedia}
        mediaList={mediaList}
        currentIndex={currentMediaIndex}
        onNavigate={(newIndex) => {
          setCurrentMediaIndex(newIndex);
          setSelectedMedia(mediaList[newIndex]);
        }}
      />
    </div>
  );
};

export default GroupMessage;
