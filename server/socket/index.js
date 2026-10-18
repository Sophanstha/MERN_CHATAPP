import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";
import { set } from "mongoose";
import User from "../models/user.model.js";
import { Conversation, Message } from "../models/converstion.model.js";
import Group from "../models/group.model.js";
import { getConversion } from "../helper/getConversion.js";
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(",").forEach((orig) => {
    const trimmed = orig.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.ORIGIN === "*" || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin.replace(/\/+$/, "") === process.env.FRONTEND_URL.replace(/\/+$/, "")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

const onlineUser = new Set();
io.on("connection", async (socket) => {
  const cookieToken = socket.handshake?.headers?.cookie?.match(/token=([^;]+)/)?.[1];
  const token = socket.handshake?.auth?.token || cookieToken || "";
  const user = await getUserDetailFromToken(token);
  if (user?._id) {
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());
    io.emit("onlineUser", Array.from(onlineUser));

    // Send initial conversations to connected client
    try {
      const convs = await getConversion(user._id.toString());
      socket.emit("conversion", convs);
    } catch (e) {
      console.error("Error sending initial conversions:", e);
    }

    // Auto-join group rooms for this user
    try {
      const userGroups = await Group.find({ members: user._id }).select("_id");
      userGroups.forEach((g) => {
        socket.join(g._id.toString());
      });
    } catch (e) {
      console.error("Error auto-joining groups:", e);
    }
  }

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
  const userBlocked = (user?.blockedUsers || []).map(id => id.toString());
  const receiverUser = await User.findById(userId);
  const receiverBlocked = (receiverUser?.blockedUsers || []).map(id => id.toString());

  const filteredMessages = getConversationMessage?.messages?.filter(msg => {
    const msgSenderId = msg?.msgByUserId?.toString();
    return !userBlocked.includes(msgSenderId) && !receiverBlocked.includes(user?._id?.toString());
  }) || [];

  socket.emit("message", filteredMessages);
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

    const senderBlocked = (sender?.blockedUsers || []).map(id => id.toString());
    const receiverBlocked = (receiver?.blockedUsers || []).map(id => id.toString());

    if (
      senderBlocked.includes(data.receiver?.toString()) ||
      receiverBlocked.includes(data.sender?.toString())
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
    const targetId = curretId || user?._id?.toString();
    if (targetId) {
      const conversion = await getConversion(targetId);
      socket.emit("conversion", conversion);
    }
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

    io.to(user?._id?.toString()).emit("conversion", conversationSender);
    io.to(msgByUserId).emit("conversion", conversationReceiver);
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

  // ===================== GROUP CHAT SOCKET EVENTS =====================
  socket.on("join-group", (groupId) => {
    if (groupId) {
      socket.join(groupId.toString());
    }
  });

  socket.on("group-page", async (groupId) => {
    try {
      if (!groupId) return;
      socket.join(groupId.toString());

      const group = await Group.findById(groupId)
        .populate("members", "name email profile_pic")
        .populate("admin", "name email profile_pic")
        .populate({
          path: "messages",
          populate: { path: "msgByUserId", select: "name profile_pic email" },
        });

      if (group) {
        socket.emit("group-data", {
          _id: group._id,
          name: group.name,
          profile_pic: group.profile_pic,
          admin: group.admin,
          members: group.members,
        });
        socket.emit("group-messages", group.messages || []);
      }
    } catch (err) {
      console.error("Error in group-page event:", err);
    }
  });

  socket.on("new-group-message", async (data) => {
    try {
      if (!data?.groupId || !data?.sender) return;

      const group = await Group.findById(data.groupId);
      if (!group) return;

      // Validate membership
      const isMember = group.members.some(
        (m) => m.toString() === data.sender.toString()
      );
      if (!isMember) {
        return socket.emit("message-error", "You are not a member of this group");
      }

      const message = new Message({
        text: data.text || "",
        imageUrl: data.imageUrl || "",
        videoUrl: data.videoUrl || "",
        msgByUserId: data.sender,
      });
      const savedMessage = await message.save();

      await Group.findByIdAndUpdate(data.groupId, {
        $push: { messages: savedMessage._id },
      });

      const populatedMessage = await Message.findById(savedMessage._id).populate(
        "msgByUserId",
        "name profile_pic email"
      );

      // Emit to everyone in the group room
      io.to(data.groupId.toString()).emit("group-message", populatedMessage);

      // Notify all member personal rooms for sidebar preview
      group.members.forEach((memberId) => {
        io.to(memberId.toString()).emit("group-sidebar-update", {
          groupId: data.groupId,
          lastMsg: populatedMessage,
          updatedAt: new Date(),
        });
      });
    } catch (err) {
      console.error("Error in new-group-message event:", err);
    }
  });

  socket.on("group-created", async (groupId) => {
    try {
      if (!groupId) return;
      const group = await Group.findById(groupId)
        .populate("members", "name email profile_pic")
        .populate("admin", "name email profile_pic");

      if (group) {
        group.members.forEach((member) => {
          io.to(member._id.toString()).emit("new-group-added", group);
        });
      }
    } catch (err) {
      console.error("Error in group-created event:", err);
    }
  });

  socket.on("disconnect", () => {
    if (user?._id) {
      onlineUser.delete(user._id.toString());
      io.emit("onlineUser", Array.from(onlineUser));
    }
    console.log("Client disconnected", socket.id);
  });
});

// ✅ Use named exports
export { app, server };
