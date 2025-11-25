#!/usr/bin/env node
/**
 * Import LinkedIn posts from your data export
 *
 * Usage:
 * 1. Go to LinkedIn Settings > Get a copy of your data
 * 2. Select "Posts" and request the archive
 * 3. Wait for email, download and unzip it
 * 4. Run: node scripts/import-linkedin.js /path/to/linkedin-archive/
 *
 * This will create src/data/linkedin-posts.json with your posts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function main() {
  const archivePath = process.argv[2];

  if (!archivePath) {
    console.log(`
Usage: node scripts/import-linkedin.js <path-to-linkedin-archive-folder>

Steps to export your LinkedIn data:
1. Go to linkedin.com/mypreferences/d/download-my-data
2. Select "Posts" (or "Want something in particular?")
3. Request the archive and wait for the email
4. Download and extract the ZIP file
5. Run this script with the path to the extracted folder
    `);
    process.exit(1);
  }

  if (!fs.existsSync(archivePath)) {
    console.error(`Directory not found: ${archivePath}`);
    process.exit(1);
  }

  // LinkedIn exports can have different file names
  const possibleFiles = [
    "Shares.csv",
    "Posts.csv",
    "shares.csv",
    "posts.csv",
    "UGC Posts.csv",
  ];

  let postsFile = null;
  for (const file of possibleFiles) {
    const fullPath = path.join(archivePath, file);
    if (fs.existsSync(fullPath)) {
      postsFile = fullPath;
      break;
    }
  }

  if (!postsFile) {
    console.error(`
Could not find posts file in the archive.
Looking for one of: ${possibleFiles.join(", ")}

Available files in ${archivePath}:
${fs.readdirSync(archivePath).join("\n")}
    `);
    process.exit(1);
  }

  console.log(`Reading posts from ${postsFile}...`);

  const content = fs.readFileSync(postsFile, "utf-8");
  let records;

  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });
  } catch (e) {
    console.error("Failed to parse CSV file");
    console.error(e.message);
    process.exit(1);
  }

  console.log(`Found ${records.length} posts`);

  // Convert to our format
  // LinkedIn CSV columns vary, but commonly include:
  // - Date or ShareDate
  // - ShareCommentary or Commentary
  // - ShareLink or Link
  const posts = records
    .map((record, index) => {
      const content =
        record.ShareCommentary ||
        record.Commentary ||
        record.Content ||
        record.Text ||
        "";
      const date =
        record.Date ||
        record.ShareDate ||
        record["Created Date"] ||
        new Date().toISOString();
      const link =
        record.ShareLink ||
        record.Link ||
        record.URL ||
        `https://linkedin.com/in/maxghenis`;

      return {
        id: `linkedin-${index}`,
        content: content.trim(),
        date: new Date(date).toISOString(),
        url: link,
        likes: parseInt(record.Likes || record.LikeCount) || 0,
      };
    })
    // Filter out empty posts
    .filter((post) => post.content.length > 0)
    // Sort by date, newest first
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`Filtered to ${posts.length} posts with content`);

  const outputPath = path.join(__dirname, "../src/data/linkedin-posts.json");
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`Wrote ${posts.length} posts to ${outputPath}`);
}

main();
