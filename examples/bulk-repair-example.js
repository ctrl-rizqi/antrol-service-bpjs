// Bulk Repair API - Node.js Example

const axios = require("axios");

// Configuration
const API_BASE_URL = "http://localhost:3000";
const AUTH_TOKEN = "your_jwt_token_here";

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
});

/**
 * Bulk repair task ID for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
async function bulkRepairTaskId(startDate, endDate) {
  try {
    console.log(`Starting bulk repair for range: ${startDate} to ${endDate}`);

    const response = await api.post("/api/task-id/bulk-repair", {
      startDate,
      endDate,
    });

    const result = response.data;

    if (result.success) {
      console.log("✅ Bulk repair completed successfully");
      console.log(`📊 Total processed: ${result.data.totalProcessed}`);
      console.log(`✅ Success: ${result.data.successCount}`);
      console.log(`❌ Failed: ${result.data.failedCount}`);

      // Show failed items
      if (result.data.failedCount > 0) {
        console.log("\n❌ Failed items:");
        result.data.results
          .filter((item) => item.status === "failed")
          .forEach((item) => {
            console.log(`  - ${item.visit_id}: ${item.message}`);
          });
      }

      return result;
    } else {
      console.log("❌ Bulk repair failed:", result.message);
      return null;
    }
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Example usage functions
 */
async function runExamples() {
  console.log("🚀 Running bulk repair examples...\n");

  // Example 1: Repair single day
  console.log("Example 1: Repair single day (2024-01-15)");
  await bulkRepairTaskId("2024-01-15", "2024-01-15");

  console.log("\n" + "=".repeat(50) + "\n");

  // Example 2: Repair one week
  console.log("Example 2: Repair one week (Jan 8-14, 2024)");
  await bulkRepairTaskId("2024-01-08", "2024-01-14");

  console.log("\n" + "=".repeat(50) + "\n");

  // Example 3: Repair one month
  console.log("Example 3: Repair one month (January 2024)");
  await bulkRepairTaskId("2024-01-01", "2024-01-31");

  console.log("\n✅ All examples completed!");
}

/**
 * Advanced usage with progress tracking
 */
async function bulkRepairWithProgress(startDate, endDate) {
  console.log(`📅 Processing bulk repair for ${startDate} to ${endDate}`);

  const startTime = Date.now();

  try {
    const result = await bulkRepairTaskId(startDate, endDate);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // seconds

    if (result) {
      console.log(`\n⏱️  Processing time: ${duration} seconds`);
      console.log(
        `📊 Success rate: ${((result.data.successCount / result.data.totalProcessed) * 100).toFixed(1)}%`,
      );

      // Save results to file (optional)
      const fs = require("fs");
      const filename = `bulk-repair-${startDate}-to-${endDate}-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(result, null, 2));
      console.log(`💾 Results saved to: ${filename}`);
    }
  } catch (error) {
    console.error("💥 Bulk repair failed:", error.message);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  // Check if running with specific dates
  const args = process.argv.slice(2);

  if (args.length === 2) {
    // Usage: node bulk-repair-example.js 2024-01-01 2024-01-31
    bulkRepairWithProgress(args[0], args[1]);
  } else if (args.length === 1 && args[0] === "examples") {
    // Usage: node bulk-repair-example.js examples
    runExamples();
  } else {
    console.log("Usage:");
    console.log("  node bulk-repair-example.js 2024-01-01 2024-01-31");
    console.log("  node bulk-repair-example.js examples");
  }
}

module.exports = {
  bulkRepairTaskId,
  bulkRepairWithProgress,
};
