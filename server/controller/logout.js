export const logout = async(req,res)=>{
    try {
        const cookieOption = {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? "None" : "Lax"
        } 
        return res.cookie("token","",cookieOption).status(200).json({
            message : "Logged out successfully",
            success : true
        })
        
    } catch (error) {
        return res.status(400).json({
            message: "Error logging out"+ error.message,
        })
         
        
    }
}