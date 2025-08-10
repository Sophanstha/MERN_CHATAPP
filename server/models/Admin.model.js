import mongoose from "mongoose"

const AdminSchema = new mongoose.Schema({
    name :{
        type:String,
        required:[true,"provide name"]
    },
    email:{
        type:String,
        required:[true,"provide email"],
        unique:true
    },
    password :{
        type:String,
        required:[true,"provide password"]
    },
    profile_pic :{
        type:String,
        default:""
    }

},{
    timestamps:true
})

const Admin = mongoose.model("Admin",AdminSchema);
export default Admin;