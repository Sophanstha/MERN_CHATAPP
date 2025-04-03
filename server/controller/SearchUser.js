import User from "../models/user.model.js";

export const  SearchUser = async(req,res) =>{

    try {
        const {search} = req.body;
        const query = new RegExp(search,"i","g");
        const user = await User.find({
            $or: [
                {name: query},
                {email:query}
            ]
        })
        res.status(200).json({
            status: "success",
            data: user,
            sucess : true
        })
        
    } catch (error) {
        return res.status(400).json({
            message: "Error" || error.message,
            error : true 
        })
        
    }

}
