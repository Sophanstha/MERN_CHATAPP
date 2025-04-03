import User from "../models/user.model.js";
import bcryptjs from "bcryptjs"
// import express from "express"
export async function registerUser(request,response){
    try {
        const { name, email , password, profile_pic } = request.body

        const checkEmail = await User.findOne({ email }) //{ name,email}  // null

        if(checkEmail){
            return response.status(400).json({
                message : "Already user exits",
                error : true,
            })
        }

        //password into hashpassword
        const salt = await bcryptjs.genSalt(10)
        const hashpassword = await bcryptjs.hash(password,salt)
        console.log("profile :" ,profile_pic);
        

        const payload = {
            name,
            email,
            profile_pic,
            password : hashpassword
        }

        const user = new User(payload)
        const userSave = await user.save()

        return response.status(201).json({
            message : "User created successfully",
            data : userSave,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}


// export default {registerUser}/