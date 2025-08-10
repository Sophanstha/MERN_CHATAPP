import { Router } from "express";
import getAllUser from "../controller/GetAllUser.js";
import { AdminRegister } from "../controller/AdminRegister.js";
import AdminLogin from "../controller/AdminLogin.js";
import getAllAdmin from "../controller/getAllAdmin.js";
import { getUserWithContacts } from "../controller/getUserContract.js";
import deleteUser from "../controller/deleteUser.js";
// import { AdmincheckEmail } from "../controller/AdminCheckEmail.js";
// import { AdmincheckPassword } from "../controller/AdminCheckPassword.js";

const AdminRouter = Router();
AdminRouter.get("/getAllUser",getAllUser);
AdminRouter.post("/register",AdminRegister);
AdminRouter.post("/login",AdminLogin)
AdminRouter.get("/getAllAdmin",getAllAdmin);
AdminRouter.get("/singleinfo/:userId",getUserWithContacts);
AdminRouter.post("/deleteuser/:id",deleteUser);
// AdminRouter.post("/checkEmail",AdmincheckEmail);
// AdminRouter.post("/checkPassword",AdmincheckPassword);
export default AdminRouter;