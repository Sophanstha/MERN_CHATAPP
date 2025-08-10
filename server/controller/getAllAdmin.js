import Admin from "../models/Admin.model.js";

const getAllAdmin = async(req,res)=>{
  try {
        const users = await Admin.find().select("-password");
      return  res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users" });
    }
}

export default getAllAdmin;