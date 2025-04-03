import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";

export const UserDetail =async( req,res)=>{
    try {
        const token = req.cookies.token || "";
   
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
