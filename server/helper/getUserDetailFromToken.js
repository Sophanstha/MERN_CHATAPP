import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const getUserDetailFromToken = async (token)=>{
    try {
        if(!token){
            return { 
                message: "seesion out",
                logout : true
            };
        }
        const decode = jwt.verify(token, process.env.JWT_SECERT);
        const user = await User.findById(decode.userid);

        return user;
        
    } catch (error) {
        return {
            status: false,
            message: "Error"
        }
        
    }
} 