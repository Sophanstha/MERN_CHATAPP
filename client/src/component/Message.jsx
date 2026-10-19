import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { data, Link, useParams } from "react-router-dom";
import backgroundImage from "../assets/wallapaper.jpeg";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo, FaPlay } from "react-icons/fa6";
import { FiMaximize2 } from "react-icons/fi";
import Avatar from "./Avatar";
import uploadFile from "../helper/Uploadfile";
import { IoClose } from "react-icons/io5";
import Loading from "./Loading";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import MediaModal from "./MediaModal";

const Message = () => {
  const param = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const [loading,setLoading] = useState(false);
  const user = useSelector((state) => state?.user);
  const [showImageAndVideo, setImageAndVideo] = useState(false);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profilePic: "",
    onlineUser: "",
    _id: "",
  });
  const [message, setMessage] = useState({
    text : "",
    imageUrl : "",
    videoUrl : ""
  });
  const [Allmessage,setAllmessage] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Collect all media messages for gallery navigation
  const mediaList = useMemo(() => {
    const list = [];
    Allmessage?.forEach((msg) => {
      if (msg?.imageUrl) {
        list.push({
          url: msg.imageUrl,
          type: "image",
          text: msg.text,
          createdAt: msg.createdAt,
          _id: msg._id,
        });
      }
      if (msg?.videoUrl) {
        list.push({
          url: msg.videoUrl,
          type: "video",
          text: msg.text,
          createdAt: msg.createdAt,
          _id: msg._id,
        });
      }
    });
    return list;
  }, [Allmessage]);

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

  const currentMessage = useRef(null);
  const handleOpenImageAndVideo = () => setImageAndVideo((prev) => !prev);
  const handleUploadImage = async(e)=>{
    const file =e.target.files[0]
    setLoading(true);
    const res = await uploadFile(file);
    setLoading(false)
    setMessage((prev) => ({...prev, imageUrl: res?.url}))
    setImageAndVideo(false);


  }
  const handleUploadVideo = async (e)=>{
    const file =e.target.files[0]
    setLoading(true);
    const res = await uploadFile(file);
    setLoading(false)
    
    setMessage((prev) => ({...prev, videoUrl: res?.url}))
    setImageAndVideo(false);
  }
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", param?.userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });
      socketConnection.emit('seen',param?.userId)

      socketConnection.on("message",(data)=>{ 
        console.log("message-data",data);
        setAllmessage(data);
      })


    }
  }, [socketConnection, param?.userId, user]);
  // console.log(dataUser);

    const handleClearUploadImage = ()=>{
      setMessage(preve => {
        return{
          ...preve,
          imageUrl : ""
        }
      })
    }
    const handleClearUploadVideo = ()=>{
      setMessage(preve => {
        return{
          ...preve,
          videoUrl : ""
        }
      })
    }
    const handleOnchange = (e)=>{
      const {text,value} = e.target ;
      setMessage((prev)=>{
        return{
          ...prev ,
          text : value
        }
      } )

    }
    const handleSendMessage = (e)=>{
      e.preventDefault()
      if(message.text || message.imageUrl || message.videoUrl){
        if(socketConnection){
          socketConnection.emit("new-message", {
            sender : user?._id,
            receiver : param?.userId ,
            text : message.text ,
            imageUrl : message.imageUrl ,
            videoUrl : message.videoUrl,
            msgByUserId : user?._id
            
          })
          setMessage({
            text : "",
            imageUrl : "",
            videoUrl : ""
          })
        }
      }

    }
  
    useEffect(()=>{
      if(currentMessage.current){
        currentMessage.current.scrollIntoView({behavior : 'smooth', block : 'end'})
    }
    },[Allmessage])
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center px-4 transition-colors">
        <div className="flex items-center gap-3">
          <Link to={"/home"} className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-teal-600">
            <FaAngleLeft size={24} />
          </Link>
          <div className="flex-shrink-0">
            <Avatar
              width={42}
              height={42}
              profile_pic={dataUser?.profilePic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white line-clamp-1">
              {dataUser?.name}
            </h3>
            <p className="text-xs">
              {dataUser.online ? (
                <span className="text-teal-600 dark:text-teal-400 font-medium">Online</span>
              ) : (
                <span className="text-slate-400">Offline</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <button className="cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <HiDotsVertical size={18} />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <section className="flex-1 overflow-x-hidden overflow-y-auto scrollbar relative bg-slate-100/60 dark:bg-slate-950 p-4 transition-colors">
        <div className="flex flex-col gap-2.5 max-w-4xl mx-auto" ref={currentMessage}>
          {Allmessage?.map((msg, index) => {
            const isMe = user._id === msg?.msgByUserId;
            return (
              <div
                key={msg?._id || index}
                className={`p-2.5 rounded-2xl w-fit max-w-[280px] sm:max-w-md md:max-w-lg shadow-sm transition-all ${
                  isMe
                    ? "ml-auto bg-teal-600 text-white rounded-tr-xs"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-gray-100 dark:border-slate-700/60"
                }`}
              >
                <div className="w-full relative rounded-lg overflow-hidden">
                  {msg?.imageUrl && (
                    <div
                      onClick={() =>
                        handleOpenMedia({
                          url: msg.imageUrl,
                          type: "image",
                          text: msg.text,
                          createdAt: msg.createdAt,
                        })
                      }
                      className="group relative cursor-pointer overflow-hidden rounded-lg mb-1.5"
                      title="Click to view full screen"
                    >
                      <img
                        src={msg?.imageUrl}
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
                        })
                      }
                      className="group relative cursor-pointer overflow-hidden rounded-lg mb-1.5 bg-black/40"
                      title="Click to view full screen"
                    >
                      <video
                        src={msg?.videoUrl}
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
                </div>
                {msg.text && (
                  <p className="text-sm font-normal px-1 leading-relaxed break-words">
                    {msg.text}
                  </p>
                )}
                <p
                  className={`text-[10px] mt-1 text-right w-full ${
                    isMe ? "text-teal-100" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {moment(msg.createdAt).format("hh:mm A")}
                </p>
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
                onClick={handleClearUploadImage}
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
                onClick={handleClearUploadVideo}
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
            onClick={handleOpenImageAndVideo}
            type="button"
            className="flex justify-center items-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            title="Attach media"
          >
            <FaPlus size={18} />
          </button>
          {showImageAndVideo && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl absolute bottom-14 left-0 w-40 p-2 text-slate-700 dark:text-slate-200 z-20">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <FaImage size={18} className="text-teal-500" />
                  <span className="text-sm font-medium">Image</span>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center p-2 gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <FaVideo size={18} className="text-purple-500" />
                  <span className="text-sm font-medium">Video</span>
                </label>

                <input
                  type="file"
                  id="uploadImage"
                  onChange={handleUploadImage}
                  className="hidden"
                  accept="image/*"
                />
                <input
                  type="file"
                  id="uploadVideo"
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
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2.5 px-4 rounded-full outline-none border border-transparent focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
            value={message.text}
            onChange={handleOnchange}
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

export default Message;
