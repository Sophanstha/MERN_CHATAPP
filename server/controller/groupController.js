import Group from "../models/group.model.js";
import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";
import mongoose from "mongoose";

const getAuthUser = async (req) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization) ||
    "";
  if (!token) return null;
  const user = await getUserDetailFromToken(token);
  return user?._id ? user : null;
};

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const { name, profile_pic, members } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required", success: false });
    }

    // Ensure member IDs are valid ObjectIds
    let memberList = Array.isArray(members) ? members : [];
    const validMembers = new Set(
      memberList
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => id.toString())
    );

    // Always include current user as member
    validMembers.add(user._id.toString());

    if (validMembers.size < 2) {
      return res.status(400).json({
        message: "A group must have at least 2 members",
        success: false,
      });
    }

    const newGroup = new Group({
      name: name.trim(),
      profile_pic: profile_pic || "",
      admin: user._id,
      members: Array.from(validMembers),
      messages: [],
    });

    const savedGroup = await newGroup.save();
    const populatedGroup = await Group.findById(savedGroup._id)
      .populate("members", "name email profile_pic")
      .populate("admin", "name email profile_pic");

    return res.status(201).json({
      message: "Group created successfully",
      success: true,
      data: populatedGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({
      message: error.message || "Failed to create group",
      success: false,
    });
  }
};

// Get all groups for the logged-in user
export const getMyGroups = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const groups = await Group.find({ members: user._id })
      .populate("members", "name email profile_pic")
      .populate("admin", "name email profile_pic")
      .populate({
        path: "messages",
        populate: { path: "msgByUserId", select: "name profile_pic email" },
      })
      .sort({ updatedAt: -1 });

    const formattedGroups = groups.map((g) => {
      const lastMsg = g.messages && g.messages.length > 0 ? g.messages[g.messages.length - 1] : null;
      return {
        _id: g._id,
        name: g.name,
        profile_pic: g.profile_pic,
        admin: g.admin,
        members: g.members,
        lastMsg,
        isGroup: true,
        updatedAt: g.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedGroups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch groups",
      success: false,
    });
  }
};

// Get specific group details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID", success: false });
    }

    const group = await Group.findById(groupId)
      .populate("members", "name email profile_pic")
      .populate("admin", "name email profile_pic");

    if (!group) {
      return res.status(404).json({ message: "Group not found", success: false });
    }

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch group details",
      success: false,
    });
  }
};

// Add members to an existing group
export const addMembers = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const { groupId, memberIds } = req.body;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID", success: false });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found", success: false });
    }

    const isMember = group.members.some((m) => m.toString() === user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group", success: false });
    }

    const validNewMembers = (Array.isArray(memberIds) ? memberIds : [memberIds]).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: validNewMembers } } },
      { new: true }
    )
      .populate("members", "name email profile_pic")
      .populate("admin", "name email profile_pic");

    return res.status(200).json({
      message: "Members added successfully",
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    return res.status(500).json({
      message: error.message || "Failed to add members",
      success: false,
    });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const { groupId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID", success: false });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: user._id } },
      { new: true }
    );

    return res.status(200).json({
      message: "You have left the group",
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({
      message: error.message || "Failed to leave group",
      success: false,
    });
  }
};
