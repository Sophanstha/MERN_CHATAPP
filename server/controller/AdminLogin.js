import Admin from "../models/Admin.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminLogin = async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || '12345';
  const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000, // 1 hour
  };

  try {
    const { email, password } = req.body;
    console.log(email , password)

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...adminData } = admin._doc;

    return res
      .status(200)
      .cookie("token", token, cookieOption)
      .json({
        message: "Admin logged in successfully",
        admin: adminData,
      });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export default AdminLogin