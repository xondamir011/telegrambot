import axios from "axios";

export async function checkCode(code) {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a strict programming teacher. Check the code and give short feedback and score from 0 to 10."
          },
          {
            role: "user",
            content: code
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.choices?.[0]?.message?.content || "No feedback";
  } catch (err) {
    console.log("AI ERROR:", err.message);
    return "❌ AI tekshira olmadi";
  }
}