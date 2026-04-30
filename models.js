import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  chatId: Number,
  name: String,
  role: { type: String, default: "student" }
});

const taskSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const submissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  taskId: mongoose.Schema.Types.ObjectId,
  code: String,
  score: Number,
  feedback: String
});

export const User = mongoose.model("User", userSchema);
export const Task = mongoose.model("Task", taskSchema);
export const Submission = mongoose.model("Submission", submissionSchema);