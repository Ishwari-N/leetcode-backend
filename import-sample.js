const mongoose = require("mongoose");
require("dotenv").config();

async function importSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");
    
    // Define proper schema
    const questionSchema = new mongoose.Schema({
      leetcodeId: String,
      title: String,
      titleSlug: String,
      difficulty: String,
      company: String,
      frequency: Number,
      isCompleted: { type: Boolean, default: false },
      tags: [String]
    }, {
      timestamps: true
    });
    
    const Question = mongoose.model("Question", questionSchema, "questions");
    
    // Clear existing data
    await Question.deleteMany({});
    console.log("🧹 Cleared existing questions");
    
    // Add sample company questions
    const sampleQuestions = [
      {
        leetcodeId: '1',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        difficulty: 'Easy',
        company: 'Amazon',
        frequency: 5,
        tags: ['Array', 'Hash Table']
      },
      {
        leetcodeId: '2',
        title: 'Add Two Numbers',
        titleSlug: 'add-two-numbers',
        difficulty: 'Medium',
        company: 'Google',
        frequency: 4,
        tags: ['Linked List', 'Math']
      },
      {
        leetcodeId: '3',
        title: 'Longest Substring Without Repeating Characters',
        titleSlug: 'longest-substring-without-repeating-characters',
        difficulty: 'Medium',
        company: 'Facebook',
        frequency: 3,
        tags: ['Hash Table', 'String']
      },
      {
        leetcodeId: '4',
        title: 'Median of Two Sorted Arrays',
        titleSlug: 'median-of-two-sorted-arrays',
        difficulty: 'Hard',
        company: 'Microsoft',
        frequency: 2,
        tags: ['Array', 'Binary Search']
      },
      {
        leetcodeId: '5',
        title: 'Longest Palindromic Substring',
        titleSlug: 'longest-palindromic-substring',
        difficulty: 'Medium',
        company: 'Apple',
        frequency: 3,
        tags: ['String', 'Dynamic Programming']
      }
    ];
    
    await Question.insertMany(sampleQuestions);
    console.log(`✅ Added ${sampleQuestions.length} sample company questions`);
    
    // Verify the data
    const count = await Question.countDocuments();
    console.log(`📊 Total questions now: ${count}`);
    
    const companies = await Question.distinct("company");
    console.log(`🏢 Companies added: ${companies.join(", ")}`);
    
    await mongoose.disconnect();
    console.log("\n✅ Import completed!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

importSampleData();
