const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  console.log("🔗 Testing MongoDB Atlas connection...");
  console.log("URI found:", process.env.MONGODB_URI ? "Yes" : "No");
  
  try {
    // Simplified connection without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("✅ Connected to MongoDB Atlas!");
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📁 Collections found:");
    if (collections.length === 0) {
      console.log("  No collections found!");
    } else {
      collections.forEach(col => console.log(`  - ${col.name}`));
    }
    
    // Check if questions collection exists
    if (collections.some(c => c.name === "questions")) {
      // Simple schema to read data
      const questionSchema = new mongoose.Schema({}, { strict: false });
      const Question = mongoose.model("Question", questionSchema, "questions");
      
      const count = await Question.countDocuments();
      console.log(`\n📊 Questions in database: ${count}`);
      
      if (count > 0) {
        const sample = await Question.findOne();
        console.log("\n📝 Sample question:");
        console.log("  Title:", sample.title || "N/A");
        console.log("  Company:", sample.company || "N/A");
        console.log("  Difficulty:", sample.difficulty || "N/A");
      } else {
        console.log("\n📭 Database is empty - no questions found");
      }
    } else {
      console.log('\n❌ No "questions" collection found!');
    }
    
    await mongoose.disconnect();
    console.log("\n✅ Test completed!");
    
  } catch (error) {
    console.error("\n❌ Connection failed:", error.message);
    console.log("Error code:", error.code || "N/A");
    console.log("Error name:", error.name || "N/A");
  }
}

testConnection();
