import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";
import { set } from "mongoose";
import User from "../models/user.model.js";
import { Conversation, Message } from "../models/converstion.model.js";
import { getConversion } from "../helper/getConversion.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true, // Allow cookies
  },
});

const onlineUser = new Set();
io.on("connection", async (socket) => {
  // console.log("Client connected", socket.id);
  const token = socket.handshake.auth.token;
  // console.log("token",token);
  const user = await getUserDetailFromToken(token);
  console.log(user);
  socket.join(user?._id?.toString());
  onlineUser.add(user?._id?.toString());
  io.emit("onlineUser", Array.from(onlineUser));
  socket.on("message-page", async (userId) => {
    // console.log("message-page",userId);
    const userDetail = await User.findById(userId).select("-password");
    const payload = {
      _id: userDetail?._id,
      name: userDetail?.name,
      email: userDetail?.email,
      profilePic: userDetail?.profile_pic,
      online: onlineUser.has(userId),
    };
    socket.emit("message-user", payload);
    // getPrevious message ;
  
     const getConversationMessage = await Conversation.findOne({
    "$or": [
      { sender: user?._id, receiver: userId },
      { sender: userId, receiver: user?._id }
    ]
  }).populate('messages').sort({ updatedAt: -1 });

  // Filter out messages from blocked users
  const filteredMessages = getConversationMessage?.messages.filter(msg => {
    return !user.blockedUsers.includes(msg.msgByUserId) &&
           !(msg.recipient === user._id && sender.blockedUsers?.includes(user._id));
  });

  socket.emit("message", filteredMessages || []);
  });

  // //
  // socket.on("new-message",async(data)=>{
  //     let conversation = await Conversation.findOne({
  //         $or: [{
  //             sender: data?.sender ,receiver : data?.receiver
  //         },
  //     {
  //         sender: data?.receiver ,
  //         receiver : data?.sender
  //     }]
  //     })
  //     if(!conversation){
  //         const createConverstion = await Conversation({
  //             sender : data?.sender ,
  //             receiver : data?.receiver ,
  //         })
  //         conversation = await createConverstion.save()
  //     }
  //     const message =new Message({
  //         text : data?.text ,
  //         imageUrl : data?.imageUrl ,
  //         videoUrl : data?.videoUrl
  //     })
  //     const newMessage =await message.save();
  // // console.log("new messsage ",newMessage)
  //     const updateConversion = await conversation.updateOne({
  //         _id : conversation?._id
  //     },{
  //         $push : { messages: newMessage?._id }
  //     })

  //     const getCOnverstion = await Conversation.findOne({
  //         $or: [{
  //             sender: data?.sender ,receiver : data?.receiver
  //         },
  //     {
  //         sender: data?.receiver ,
  //         receiver : data?.sender
  //     }]
  //     }).populate('messages').sort({ updatedAt : -1 })

  //     console.log("getConversion",getCOnverstion);

  // })
  //new message
  socket.on("new-message", async (data) => {
    //check conversation is available both user
    const sender = await User.findById(data.sender);
    const receiver = await User.findById(data.receiver);

    if (
      sender.blockedUsers.includes(data.receiver) ||
      receiver.blockedUsers.includes(data.sender)
    ) {
      return socket.emit("message-error", "You cannot message this user");
    }

    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });

    //if conversation is not available
    if (!conversation) {
      const createConversation = await Conversation({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    const message = new Message({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data?.msgByUserId,
    });
    const saveMessage = await message.save();

    const updateConversation = await Conversation.updateOne(
      { _id: conversation?._id },
      {
        $push: { messages: saveMessage?._id },
      }
    );

    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    // console.log("getConversion",getConversationMessage);
    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );
    // handleSidebarLastMessage
    const conversionSender = await getConversion(data?.sender);
    const conversionReceiver = await getConversion(data?.receiver);
    // socket.emit("conversion",conversion)
    io.to(data?.sender).emit("conversion", conversionSender);
    io.to(data?.receiver).emit("conversion", conversionReceiver);
  });

  // handleeSibeBar
  socket.on("sidebar", async (curretId) => {
    const conversion = await getConversion(curretId);
    socket.emit("conversion", conversion);
  });
  // handleSeenUser
  socket.on("seen", async (msgByUserId) => {
    let conversation = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];

    const updateMessages = await Message.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } }
    );

    //send conversation
    const conversationSender = await getConversion(user?._id?.toString());
    const conversationReceiver = await getConversion(msgByUserId);

    io.to(user?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByUserId).emit("conversation", conversationReceiver);
  });
  // Handle block user
  socket.on("block-user", async (blockedUserId) => {
    const currentUserId = user?._id?.toString();
    if (!currentUserId || !blockedUserId) return;

    // Block the user
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: blockedUserId },
    });

    // Notify both users
    io.to(currentUserId).emit("user-blocked", blockedUserId);
    io.to(blockedUserId).emit("blocked-by-user", currentUserId);

    // Optionally, inform both users that the chat is now blocked
    io.to(currentUserId).emit("chat-ended", "You have blocked this user.");
    io.to(blockedUserId).emit("chat-ended", "You have been blocked.");
  });

  // Handle unblock user
  socket.on("unblock-user", async (unblockedUserId) => {
    const currentUserId = user?._id?.toString();
    if (!currentUserId || !unblockedUserId) return;

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: unblockedUserId },
    });

    io.to(currentUserId).emit("user-unblocked", unblockedUserId);
  });

  socket.on("disconnect", () => {
    onlineUser.delete(user?._id);
    console.log("Client disconnected", socket.id);
  });
});

// ✅ Use named exports
export { app, server };
