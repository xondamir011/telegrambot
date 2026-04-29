import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const chats = {};

// 🌐 LANGUAGE DETECT
function detectLang(text = "") {
  const uzWords = [
    "salom", "nima", "qalay", "rahmat",
    "yordam", "qanday", "qanaqa", "nega", "qayerda"
  ];

  return uzWords.some(w => text.toLowerCase().includes(w))
    ? "uz"
    : "en";
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Salom! Men Xondamirni AI assistentman 😎\nIstalgan savolni berishingiz mumkin!"
  );
});

// 💬 MESSAGE
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  const userText = msg.text;

  if (!chats[chatId]) chats[chatId] = [];
  if (chats[chatId].length > 10) chats[chatId].shift();

  const lang = detectLang(userText);

  chats[chatId].push({
    role: "user",
    content: userText,
  });

  try { 
    bot.sendChatAction(chatId, "typing");
   
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai.gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              lang === "uz"
                ? "Sen o‘zbek tilida juda sodda, aniq va foydali javob beradigan AI assistentsan. Har doim o‘zbek tilida javob ber."
                : "You are a helpful AI assistant. Always answer clearly in English.",
          },
          ...chats[chatId],
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://t.me/@uzingshop_bot",
          "X-Title": "telegram-ai-bot",
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "Javob topilmadi 😅";

    chats[chatId].push({
      role: "assistant",
      content: reply,
    });

    bot.sendMessage(chatId, reply);

  } catch (err) {
    console.log("ERROR:", err?.response?.data || err.message);

    bot.sendMessage(
      chatId,
      "😅 AI hozir javob bera olmayapti. Keyinroq urinib ko‘ring."
    );
  }
});

console.log("🤖 AI bot ishlayapti...");
console.log("BOT TOKEN:", process.env.BOT_TOKEN);
console.log("OPENROUTER:", process.env.OPENROUTER_API_KEY);