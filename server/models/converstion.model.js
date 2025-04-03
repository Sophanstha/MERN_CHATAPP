import mongoose from "mongoose";

// Message Schema
const messagesSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    msgByUserId:{
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,      
    }
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messagesSchema);

// Conversation Schema
const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message", // Now correctly referencing the Message model
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export { Conversation, Message };
