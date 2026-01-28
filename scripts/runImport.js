const LeetCodeImporter = require('./importLeetcode');
const path = require('path');

// Set the data directory
const DATA_DIR = path.join(__dirname, '../data/company-wise-leetcode');

// Create and run importer
const importer = new LeetCodeImporter();

importer.run(DATA_DIR).catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});