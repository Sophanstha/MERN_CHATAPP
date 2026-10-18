import { getConversion } from "../helper/getConversion.js";
import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";

export const getConversationsController = async (req, res) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization) ||
      "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        logout: true,
      });
    }

    const user = await getUserDetailFromToken(token);
    if (!user?._id) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        logout: true,
      });
    }

    const conversations = await getConversion(user._id.toString());

    return res.status(200).json({
      success: true,
      data: conversations || [],
    });
  } catch (error) {
    console.error("Error in getConversationsController:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve conversations",
    });
  }
};
