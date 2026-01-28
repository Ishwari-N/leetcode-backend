// import-from-github.js
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

async function importFromGitHub() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // 2. Define schema (same as before)
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

    // 3. Clear existing data
    await Question.deleteMany({});
    console.log("🧹 Cleared existing questions");

    // 4. List of ALL JSON files from the GitHub repository
    const companyFiles = [
      'accolite.json', 'adobe.json', 'aetion.json', 'affinity.json', 'affirm.json',
      'airbnb.json', 'airtel.json', 'akamai.json', 'akuna-capital.json', 'akuna.json',
      'alation.json', 'alibaba.json', 'amazon.json', 'american-express.json',
      'appdynamics.json', 'apple.json', 'arista-networks.json', 'arista.json',
      'asana.json', 'atlassian.json', 'audible.json', 'baidu.json', 'barclays.json',
      'blackrock.json', 'blizzard.json', 'bloomberg.json', 'bloomreach.json',
      'booking.json', 'bookingcom.json', 'box.json', 'bytedance.json',
      'bytedancetoutiao.json', 'c3-iot.json', 'c3ai.json', 'capital-one.json',
      'cisco.json', 'citadel.json', 'citrix.json', 'cloudera.json', 'clutter.json',
      'codenation.json', 'cohesity.json', 'coupang.json', 'coursera.json',
      'cruise-automation.json', 'databricks.json', 'dataminr.json', 'de-shaw.json',
      'deliveryhero.json', 'dell.json', 'deutsche-bank.json', 'didi.json',
      'docusign.json', 'doordash.json', 'drawbridge.json', 'dropbox.json',
      'druva.json', 'ebay.json', 'electronic-arts.json', 'emc.json',
      'epic-systems.json', 'evernote.json', 'expedia.json', 'f5-networks.json',
      'facebook.json', 'factset.json', 'fallible.json', 'fidessa.json',
      'flexport.json', 'flipkart.json', 'forusall.json', 'garena.json',
      'ge-digital.json', 'gilt-groupe.json', 'godaddy.json', 'goldman-sachs.json',
      'google.json', 'grab.json', 'groupon.json', 'gsn-games.json', 'hbo.json',
      'helix.json', 'honey.json', 'hotstar.json', 'houzz.json', 'hrt.json',
      'huawei.json', 'hulu.json', 'ibm.json', 'iit-bombay.json', 'indeed.json',
      'infosys.json', 'inmobi.json', 'intel.json', 'intuit.json', 'ixl.json',
      'jane-street.json', 'jingchi.json', 'jp-morgan-chase.json', 'jpmorgan.json',
      'jump-trading.json', 'kakao.json', 'karat.json', 'leap-motion.json',
      'limebike.json', 'linkedin.json', 'liveramp.json', 'lyft.json',
      'machine-zone.json', 'machinezone.json', 'maq-software.json', 'mathworks.json',
      'mckinsey.json', 'medianet.json', 'meituan.json', 'microsoft.json',
      'microstrategy.json', 'morgan-stanley.json', 'national-instruments.json',
      'netease.json', 'netflix.json', 'netsuite.json', 'nutanix.json',
      'nvidia.json', 'opendoor.json', 'oracle.json', 'palantir-technologies.json',
      'palantir.json', 'paypal.json', 'paytm.json', 'phonepe.json', 'pinterest.json',
      'pocket-gems.json', 'point72.json', 'ponyai.json', 'poshmark.json',
      'postmates.json', 'poynt.json', 'pramp.json', 'pure-storage.json',
      'qualcomm.json', 'qualtrics.json', 'quantcast.json', 'quip.json',
      'quora.json', 'rackspace.json', 'radius.json', 'reddit.json', 'redfin.json',
      'riot-games.json', 'robinhood.json', 'roblox.json', 'rubrik.json',
      'salesforce.json', 'samsung.json', 'sap.json', 'sapient.json',
      'servicenow.json', 'snapchat.json', 'snapdeal.json', 'splunk.json',
      'spotify.json', 'square.json', 'sumologic.json', 'symantec.json',
      'tableau.json', 'tandemg.json', 'tencent.json', 'tesla.json',
      'thumbtack.json', 'traveloka.json', 'tripadvisor.json', 'triplebyte.json',
      'turvo.json', 'twilio.json', 'twitch.json', 'twitter.json',
      'two-sigma.json', 'uber.json', 'uipath.json', 'united-health-group.json',
      'valve.json', 'virtu.json', 'visa.json', 'vmware.json'
    ];

    console.log(`📥 Fetching data for ${companyFiles.length} companies...`);

    let totalQuestionsAdded = 0;
    const addedCompanies = [];

    // 5. Fetch and process each company file
    for (const fileName of companyFiles) {
      try {
        const companyName = fileName.replace('.json', '').replace(/-/g, ' ');
        
        // Fetch from GitHub raw content
        const url = `https://raw.githubusercontent.com/Justmalhar/company-wise-leetcode/main/${fileName}`;
        const response = await axios.get(url);
        
        const questionsData = response.data;
        
        if (Array.isArray(questionsData) && questionsData.length > 0) {
          // Transform the data to match our schema
          const questionsToInsert = questionsData.map(q => ({
            leetcodeId: q.id?.toString() || Math.random().toString(),
            title: q.title || 'Unknown Title',
            titleSlug: q.titleSlug || q.title?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
            difficulty: q.difficulty || 'Medium',
            company: companyName,
            frequency: q.frequency || 1,
            tags: q.tags || [],
            isCompleted: false
          }));
          
          await Question.insertMany(questionsToInsert);
          totalQuestionsAdded += questionsToInsert.length;
          addedCompanies.push(companyName);
          
          console.log(`✅ ${companyName}: Added ${questionsToInsert.length} questions`);
        } else {
          console.log(`⚠️  ${companyName}: No questions found or invalid format`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error fetching ${fileName}: ${error.message}`);
      }
    }

    // 6. Final summary
    console.log("\n📊 ======== IMPORT SUMMARY ========");
    console.log(`✅ Total questions added: ${totalQuestionsAdded}`);
    console.log(`🏢 Total companies added: ${addedCompanies.length}`);
    console.log(`📈 Average questions per company: ${Math.round(totalQuestionsAdded / addedCompanies.length)}`);
    
    // Show first 10 companies as sample
    console.log("\n🔍 Sample companies imported:");
    console.log(addedCompanies.slice(0, 10).join(", "));
    if (addedCompanies.length > 10) {
      console.log(`... and ${addedCompanies.length - 10} more`);
    }

    await mongoose.disconnect();
    console.log("\n🎉 GitHub import completed successfully!");

  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  }
}

importFromGitHub();