const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const Question = require('../src/models/Question');

const BASE_LEETCODE_URL = 'https://leetcode.com';

async function importLeetCodeQuestions() {
  console.log('🚀 Starting LeetCode questions import...');
  console.log('='.repeat(60));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Data directory
    const dataDir = path.join(__dirname, '../data/company-wise-leetcode');
    console.log(`📂 Data directory: ${dataDir}`);
    
    // Get all JSON files
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`📁 Found ${jsonFiles.length} company files`);
    
    if (jsonFiles.length === 0) {
      throw new Error('No JSON files found!');
    }
    
    const questionMap = new Map(); // To track duplicates
    let totalProcessed = 0;
    
    // Process each company file
    for (const file of jsonFiles) {
      const companyName = path.basename(file, '.json');
      const filePath = path.join(dataDir, file);
      
      console.log(`📂 Processing ${companyName}...`);
      
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const questions = JSON.parse(data);
        
        console.log(`   Found ${questions.length} questions`);
        
        for (const q of questions) {
          totalProcessed++;
          
          // Skip if missing essential data
          if (!q.title || !q.link) {
            continue;
          }
          
          // Generate leetcodeId from URL
          const leetcodeUrl = q.link.startsWith('http') 
            ? q.link 
            : `${BASE_LEETCODE_URL}${q.link}`;
          
          // Extract problem slug for ID
          let leetcodeId = '';
          const slugMatch = leetcodeUrl.match(/\/problems\/([^\/]+)/);
          if (slugMatch && slugMatch[1]) {
            leetcodeId = slugMatch[1].toLowerCase();
          } else {
            // Fallback: use title for ID
            leetcodeId = q.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
          }
          
          // Prepare question data
          const questionData = {
            leetcodeId,
            title: q.title.trim(),
            difficulty: q.difficulty || 'Medium',
            topics: Array.isArray(q.topics) ? q.topics : 
                   typeof q.topics === 'string' ? [q.topics] : [],
            companies: [companyName],
            leetcodeUrl,
            solved: false,
            isCustom: false,
            order: 0
          };
          
          // Update existing or add new
          if (questionMap.has(leetcodeId)) {
            const existing = questionMap.get(leetcodeId);
            // Add company if not already present
            if (!existing.companies.includes(companyName)) {
              existing.companies.push(companyName);
            }
            // Merge topics
            questionData.topics.forEach(topic => {
              if (topic && !existing.topics.includes(topic)) {
                existing.topics.push(topic);
              }
            });
          } else {
            questionMap.set(leetcodeId, questionData);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${companyName}:`, error.message);
      }
    }
    
    const uniqueQuestions = questionMap.size;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total questions processed: ${totalProcessed}`);
    console.log(`Unique questions found: ${uniqueQuestions}`);
    console.log(`Duplicate questions: ${totalProcessed - uniqueQuestions}`);
    
    // Import to MongoDB
    console.log('\n📦 Importing to MongoDB...');
    
    if (uniqueQuestions > 0) {
      const questions = Array.from(questionMap.values());
      
      const bulkOps = questions.map(q => ({
        updateOne: {
          filter: { leetcodeId: q.leetcodeId },
          update: { 
            $setOnInsert: {
              title: q.title,
              difficulty: q.difficulty,
              topics: q.topics.filter(t => t), // Remove empty strings
              leetcodeUrl: q.leetcodeUrl,
              solved: false,
              isCustom: false,
              order: 0
            },
            $addToSet: { 
              companies: { $each: q.companies }
            }
          },
          upsert: true
        }
      }));
      
      const result = await Question.bulkWrite(bulkOps, { ordered: false });
      
      console.log('\n✅ IMPORT COMPLETE!');
      console.log('='.repeat(60));
      console.log(`New questions inserted: ${result.upsertedCount}`);
      console.log(`Existing questions updated: ${result.modifiedCount}`);
      console.log(`Total in database: ${await Question.countDocuments()}`);
      
      // Show sample questions
      console.log('\n🎯 Sample Questions:');
      const sample = await Question.find().limit(5);
      sample.forEach((q, i) => {
        console.log(`${i + 1}. ${q.title} [${q.difficulty}]`);
        console.log(`   Companies: ${q.companies.slice(0, 3).join(', ')}${q.companies.length > 3 ? '...' : ''}`);
        console.log(`   Topics: ${q.topics.slice(0, 3).join(', ')}${q.topics.length > 3 ? '...' : ''}`);
        console.log(`   URL: ${q.leetcodeUrl}\n`);
      });
      
    } else {
      console.log('❌ No questions to import!');
      console.log('Debug: questionMap size =', questionMap.size);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 MongoDB connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  importLeetCodeQuestions().catch(console.error);
}

module.exports = importLeetCodeQuestions;