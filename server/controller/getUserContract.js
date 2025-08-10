import mongoose from "mongoose"; // Make sure this is imported
import User from "../models/user.model.js";
import { Conversation } from "../models/converstion.model.js";

export const getUserWithContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select("name email profile_pic");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversations = await Conversation.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).select("sender receiver");

    const contactIds = new Set();
    conversations.forEach((conv) => {
      const senderId = conv.sender.toString();
      const receiverId = conv.receiver.toString();

      if (senderId !== userId) contactIds.add(senderId);
      if (receiverId !== userId) contactIds.add(receiverId);
    });

    const contacts = await User.find({
      _id: { $in: Array.from(contactIds) },
    }).select("name email profile_pic");

    return res.status(200).json({ user, contacts });
  } catch (err) {
    console.error("Error in getUserWithContacts:", err);
    res.status(500).json({ message: "Server error" });
  }
};
