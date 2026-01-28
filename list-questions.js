const mongoose = require("mongoose");
require("dotenv").config();

async function listQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");
    
    // Simple schema to read data
    const questionSchema = new mongoose.Schema({}, { strict: false });
    const Question = mongoose.model("Question", questionSchema, "questions");
    
    // Get ALL questions
    const questions = await Question.find({});
    console.log(`\n📊 Total questions: ${questions.length}`);
    
    if (questions.length > 0) {
      console.log("\n📋 All questions:");
      questions.forEach((q, i) => {
        console.log(`\n${i + 1}. ${q.title || "No title"}`);
        console.log(`   Company: ${q.company || "N/A"}`);
        console.log(`   Difficulty: ${q.difficulty || "N/A"}`);
        console.log(`   ID: ${q._id}`);
      });
    } else {
      console.log("\n📭 Database is completely empty");
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listQuestions();
