import { Router } from "express";
import {
  createGroup,
  getMyGroups,
  getGroupDetails,
  addMembers,
  leaveGroup,
} from "../controller/groupController.js";

const GroupRouter = Router();

GroupRouter.post("/create", createGroup);
GroupRouter.get("/my-groups", getMyGroups);
GroupRouter.get("/:groupId", getGroupDetails);
GroupRouter.post("/add-member", addMembers);
GroupRouter.post("/leave", leaveGroup);

export default GroupRouter;
