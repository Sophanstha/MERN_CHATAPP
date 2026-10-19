import User from "../models/user.model.js";
import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";

export const updateUserDetail = async (req, res) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : req.headers.authorization) ||
            req.headers?.token ||
            "";
        const userDetail = await getUserDetailFromToken(token);

        if (!userDetail || userDetail.logout) {
            return res.status(401).json({ 
                message: "Unauthorized or session expired",
                success: false 
            });
        }

        const { name, profile_pic } = req.body;

        // Update user and return the new document
        const updatedUser = await User.findByIdAndUpdate(
            userDetail._id,
            {
                $set: {
                    name: name,
                    profile_pic: profile_pic
                }
            },
            { new: true } // Ensures it returns the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        const userInfo =await User.findById(userDetail._id)

        return res.status(200).json({
            message: "User details updated successfully",
            success: true,
            data: userInfo
        });

    } catch (error) {
        return res.status(400).json({
            message: "Error updating user details",
            error: error.message,
            success: false
        });
    }
};
