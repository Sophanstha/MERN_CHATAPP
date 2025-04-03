import User from "../models/user.model.js";
export const checkEmail =async(req,res)=>{
   try {
     const {email} = req.body;
     const user = await User.findOne({email}).select("-password");
     if (!user) {
        return res.status(200).json({ 
            message: "Email is  not available" ,
            success : false
        }
        );
     }
     return res.status(200).json({
        message: "Email is available",
        success : true,
        data : user
     })

   } catch (error) {
    return res.status(400).json({
        message: "Error checking email" ,
        error : true

    })
    
   }

 } 