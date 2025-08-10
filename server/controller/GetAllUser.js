
import User from "../models/user.model.js";

const getAllUser =async (req,res)=>{
    try {
        const users = await User.find().select("-password");
      return  res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users" });
    }
}
export default  getAllUser;
