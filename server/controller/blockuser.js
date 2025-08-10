import User from "../models/user.model.js";
import {Conversation,Message} from "../models/converstion.model.js"
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user._id;

    await User.findByIdAndUpdate(currentUser, {
      $addToSet: { blockedUsers: userId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user._id;

    await User.findByIdAndUpdate(currentUser, {
      $pull: { blockedUsers: userId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'name email profile_pic');
      
    res.status(200).json(user.blockedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};