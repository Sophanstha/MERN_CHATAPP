import Admin from "../models/Admin.model.js";
import bcryptjs from "bcryptjs";

export async function AdminRegister(request, response) {
  try {
    console.log("Request body:", request.body);

    const { name, email, password, profile_pic } = request.body;

    // Check if admin with the same email already exists
    const checkEmail = await Admin.findOne({ email });
    if (checkEmail) {
      return response.status(400).json({
        message: "Admin already exists",
        error: true,
      });
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashpassword = await bcryptjs.hash(password, salt);
    console.log("Profile picture:", profile_pic);

    // Prepare the admin payload
    const payload = {
      name,
      email,
      profile_pic,
      password: hashpassword,
    };

    // Save new admin to database
    const admin = new Admin(payload);
    const adminSave = await admin.save();

    return response.status(201).json({
      message: "Admin created successfully",
      data: adminSave,
      success: true,
    });

  } catch (error) {
    console.log("Error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
    });
  }
}
