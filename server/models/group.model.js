import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    profile_pic: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
