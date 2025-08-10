import mongoose from "mongoose";
// import User from "../models/User.js";
// import { Message, Conversation } from "../models/ChatModel.js";
import User from "../models/user.model.js";
import { Message,Conversation } from "../models/converstion.model.js";
 const deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    console.log("Deleting user:", userId);

    // Delete messages created directly by the user
    await Message.deleteMany({ msgByUserId: userId });

    // Find all conversations involving the user
    const conversations = await Conversation.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    // Collect and delete any referenced messages
    const messageIds = conversations.flatMap(conv => conv.messages);
    if (messageIds.length > 0) {
      await Message.deleteMany({ _id: { $in: messageIds } });
    }

    // Delete conversations
    await Conversation.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({ message: "Server error while deleting user data" });
  }
};
export default deleteUser;