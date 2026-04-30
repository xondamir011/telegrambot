import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios from "axios";
import { connectDB } from "./db.js";
import { User, Task, Submission } from "./models.js";
import { checkCode } from "./ai.js";

dotenv.config();
connectDB();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let currentTask = null;

// 🟢 START
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  let user = await User.findOne({ chatId });

  if (!user) {
    user = await User.create({
      chatId,
      name: msg.from.first_name
    });
  }

  bot.sendMessage(chatId, "👋 Salom! LMS botga xush kelibsiz");
});

// 👨‍🏫 TEACHER
bot.onText(/\/teacher/, async (msg) => {
  await User.updateOne(
    { chatId: msg.chat.id },
    { role: "teacher" }
  );

  bot.sendMessage(msg.chat.id, "👨‍🏫 Siz teacher bo‘ldingiz");
});

// 📚 TASK CREATE
bot.onText(/\/task (.+)/, async (msg, match) => {
  const user = await User.findOne({ chatId: msg.chat.id });

  if (!user || user.role !== "teacher") {
    return bot.sendMessage(msg.chat.id, "❌ Faqat teacher");
  }

  const task = await Task.create({
    text: match[1]
  });

  currentTask = task;

  bot.sendMessage(msg.chat.id, "📚 Task yaratildi!");
});

// ✍️ TEXT SUBMIT
bot.onText(/\/submit (.+)/, async (msg, match) => {
  const user = await User.findOne({ chatId: msg.chat.id });

  if (!currentTask) {
    return bot.sendMessage(msg.chat.id, "❌ Task yo‘q");
  }

  const code = match[1];

  const feedback = await checkCode(code);

  await Submission.create({
    userId: user._id,
    taskId: currentTask._id,
    code,
    score: Math.floor(Math.random() * 10),
    feedback
  });

  bot.sendMessage(msg.chat.id, "✅ Yuborildi!\n\n" + feedback);
});

// 📎 FILE SUBMIT (🔥 CLEAN VERSION)
bot.on("document", async (msg) => {
  try {
    if (!currentTask) {
      return bot.sendMessage(msg.chat.id, "❌ Task yo‘q");
    }

    const fileId = msg.document.file_id;

    const file = await bot.getFile(fileId);

    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

    // 🔥 RAMda olish (downloads YO‘Q)
    const res = await axios.get(fileUrl);

    const code = res.data;

    const user = await User.findOne({ chatId: msg.chat.id });

    const feedback = await checkCode(code);

    await Submission.create({
      userId: user._id,
      taskId: currentTask._id,
      code,
      score: Math.floor(Math.random() * 10),
      feedback
    });

    bot.sendMessage(msg.chat.id, "📎 File qabul qilindi\n\n" + feedback);

  } catch (err) {
    console.log("FILE ERROR:", err.message);
    bot.sendMessage(msg.chat.id, "❌ File o‘qishda xato");
  }
});

// 📊 STATUS
bot.onText(/\/status/, async (msg) => {
  if (!currentTask) {
    return bot.sendMessage(msg.chat.id, "❌ Task yo‘q");
  }

  const users = await User.find({ role: "student" });
  const subs = await Submission.find({ taskId: currentTask._id });

  const done = subs.map(s => s.userId.toString());

  const notDone = users.filter(u => !done.includes(u._id.toString()));

  let text = "📊 Topshirmaganlar:\n\n";

  if (notDone.length === 0) {
    text += "🎉 Hamma topshirgan!";
  } else {
    notDone.forEach(u => {
      text += `❌ ${u.name}\n`;
    });
  }

  bot.sendMessage(msg.chat.id, text);
});

console.log("🤖 BOT ISHLAYAPTI...");