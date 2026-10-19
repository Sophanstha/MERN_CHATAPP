// import User from "../models/user.model.js";

// export const checkPassword = async (req,res)=>{
//     try {
//         const {password,userid} = req.body;
//         const user = await User.findById(userid);
//         const verifyPassword = await bcryptjs.compare(password,user.password);
//         if(!verifyPassword){
//             return res.status(400).json({message:"Invalid password"})
//         }

//         const payload = {
//             userid : user._id,
//             email : user.email
//         }
//         const token = jwt.sign(
//             payload,
//             process.env.JWT_SECERT ,
//         );
//         const cookieOption = {
//             http : true,
//             secure : true
//         } 

//         return res.status(200)
//         .cookie("token",token,cookieOption)
//         .json({
//             message:"login succefully",
//             token : token,
//             sucess : true
//         })
        
//     } catch (error) {
//         return res.status(400).json({
//             message: `Error checking password ${error.message}`,
//             error: true
        
//         })
        
//     }
// }





// export const checkPassword = async (req, res) => {
//     const JWT_SECERT= '12345'
//     try {
//         console.log("Request received with body:", req.body); // Debugging
//         const { password, userid } = req.body;

//         if (!userid || !password) {
//             return res.status(400).json({ message: "User ID and password are required" });
//         }

//         const user = await User.findById(userid);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         console.log("User found:", user.email); // Debugging

//         const verifyPassword = await bcryptjs.compare(password, user.password);
//         if (!verifyPassword) {
//             return res.status(400).json({ message: "Invalid password" });
//         }

//         console.log("Password verified successfully"); // Debugging

//         const payload = {
//             userid: user._id,
//             email: user.email
//         };

//         const token = jwt.sign(payload, JWT_SECERT);
//         console.log("Generated token:", token); // Debugging

//         const cookieOption = {
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "None"
//         };

//         res.status(200)
//             .cookie("token", token, cookieOption)
//             .json({
//                 message: "Login successfully",
//                 token, 
//                 success: true
//             });

//     } catch (error) {
//         console.error("Server Error:", error.message); // Log the error
//         return res.status(500).json({
//             message: `Error checking password: ${error.message}`,
//             error: true
//         });
//     }
// };
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const checkPassword = async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET || '12345';

    try {
        console.log("Request received with body:", req.body); // Debugging
        const { password, userid } = req.body;

        if (!userid || !password) {
            return res.status(400).json({ message: "User ID and password are required" });
        }

        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // console.log("User found:", user.email); // Debugging

        const verifyPassword = await bcryptjs.compare(password, user.password);
        if (!verifyPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // console.log("Password verified successfully"); // Debugging

        const payload = {
            userid: user._id,
            email: user.email
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        // console.log("Generated token:", token); // Debugging

        // ✅ Fix cookie options for cross-site and HTTPS environments
        const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
        const cookieOption = {
            httpOnly: true, 
            secure: isHttps || process.env.NODE_ENV === "production",
            sameSite: isHttps || process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 365 * 24 * 60 * 60 * 1000,
        };

        // ✅ Ensure setting cookie before sending JSON response
        res.status(200)
            .cookie("token", token, cookieOption) 
            .json({
                message: "Login successfully",
                token, 
                success: true
            });

    } catch (error) {
        console.error("Server Error:", error.message);
        return res.status(500).json({
            message: `Error checking password: ${error.message}`,
            error: true
        });
    }
};

