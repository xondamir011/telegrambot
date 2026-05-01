import mongoose from "mongoose";

export const connectDB = async () => {
   try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,  
      useUnifiedTopology: true
   });

   console.log("🟢 MongoDB ulandi");

   } catch (err) {
    console.log("🔴 MongoDB ulanmadi");
    process.exit(1);
   }
};