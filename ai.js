import axios from "axios";
import dotenv from "dotenv";
import { model } from "mongoose";

dotenv.config();

export const askAI = async (question) => {
    try{
        const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openai/gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Kodga 0-10 ball ber va qisqa feedback yoz"
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
            }
         }
      );
        return res.data.choices?.[0]?.message?.content || "Javob topilmadi 😅";
    } catch (err) {
        return "AI xato berdi 😅";
    }
}