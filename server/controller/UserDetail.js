import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";

export const UserDetail =async( req,res)=>{
    try {
        const token =
            req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : req.headers.authorization) ||
            req.headers?.token ||
            "";
   
        const userDetail = await getUserDetailFromToken(token);
  
        return res.status(202).json({
            success: true,
            data: userDetail,
            message: `User Detail Retrieved Successfully `,
            
        });
    } catch (error) {
      return  res.status(500).json({ message: error.message || error });
        
    }

}
