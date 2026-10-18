import express, { Router } from "express"
// import registerController from "../controller/register.controller";
import { registerUser } from "../controller/register.js";
import { checkEmail } from "../controller/checkEmail.js";
import { checkPassword } from "../controller/checkPassword.js";
import { UserDetail } from "../controller/UserDetail.js";
import { logout } from "../controller/logout.js";
import { updateUserDetail } from "../controller/upDateUserDetaail.js";
import { SearchUser } from "../controller/SearchUser.js";
import { blockUser,unblockUser,getBlockedUsers } from "../controller/blockuser.js";
import { getConversationsController } from "../controller/getConversationsController.js";
const UserRouter = Router();

UserRouter.post("/register",registerUser)
UserRouter.post("/email",checkEmail)
UserRouter.post("/password",checkPassword)
UserRouter.get("/user-detail",UserDetail)
UserRouter.get("/conversations", getConversationsController)
UserRouter.get("/logout",logout)
UserRouter.patch("/updateuser",updateUserDetail)
UserRouter.post("/search",SearchUser)

// blockuser
UserRouter.post('/block', blockUser);
UserRouter.post('/unblock', unblockUser);
UserRouter.get('/blocked-users', getBlockedUsers);
export default UserRouter;