import express, { Router } from "express"
// import registerController from "../controller/register.controller";
import { registerUser } from "../controller/register.js";
import { checkEmail } from "../controller/checkEmail.js";
import { checkPassword } from "../controller/checkPassword.js";
import { UserDetail } from "../controller/UserDetail.js";
import { logout } from "../controller/logout.js";
import { updateUserDetail } from "../controller/upDateUserDetaail.js";
import { SearchUser } from "../controller/SearchUser.js";

const UserRouter = Router();

UserRouter.post("/register",registerUser)
UserRouter.post("/email",checkEmail)
UserRouter.post("/password",checkPassword)
UserRouter.get("/user-detail",UserDetail)
UserRouter.get("/logout",logout)
UserRouter.patch("/updateuser",updateUserDetail)
UserRouter.post("/search",SearchUser)
export default UserRouter;