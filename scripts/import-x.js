#!/usr/bin/env node
/**
 * Import X/Twitter posts from your data export
 *
 * Usage:
 * 1. Go to X Settings > Your Account > Download an archive of your data
 * 2. Wait for the archive to be ready, download and unzip it
 * 3. Run: node scripts/import-x.js /path/to/twitter-archive/data/tweets.js
 *
 * This will create src/data/x-posts.json with your posts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function main() {
  const archivePath = process.argv[2];

  if (!archivePath) {
    console.log(`
Usage: node scripts/import-x.js <path-to-tweets.js>

Steps to export your X data:
1. Go to x.com/settings/your_twitter_data
2. Click "Download an archive of your data"
3. Wait for email, download the ZIP file
4. Extract it and find data/tweets.js
5. Run this script with the path to tweets.js
    `);
    process.exit(1);
  }

  if (!fs.existsSync(archivePath)) {
    console.error(`File not found: ${archivePath}`);
    process.exit(1);
  }

  console.log(`Reading tweets from ${archivePath}...`);

  // X exports tweets.js as a JS file with: window.YTD.tweets.part0 = [...]
  let content = fs.readFileSync(archivePath, "utf-8");

  // Remove the JS variable assignment to get pure JSON
  content = content.replace(/^window\.YTD\.tweets\.part\d+\s*=\s*/, "");

  let tweets;
  try {
    tweets = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse tweets file. Is this a valid X archive?");
    console.error(e.message);
    process.exit(1);
  }

  console.log(`Found ${tweets.length} tweets`);

  // Convert to our format
  const posts = tweets
    .map((item) => {
      const tweet = item.tweet;
      return {
        id: tweet.id_str || tweet.id,
        content: tweet.full_text || tweet.text,
        date: new Date(tweet.created_at).toISOString(),
        url: `https://x.com/maxghenis/status/${tweet.id_str || tweet.id}`,
        likes: parseInt(tweet.favorite_count) || 0,
        retweets: parseInt(tweet.retweet_count) || 0,
        images:
          tweet.extended_entities?.media
            ?.filter((m) => m.type === "photo")
            ?.map((m) => m.media_url_https) || [],
      };
    })
    // Filter out retweets and replies (optional - remove if you want those too)
    .filter((post) => !post.content.startsWith("RT @"))
    .filter((post) => !post.content.startsWith("@"))
    // Sort by date, newest first
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`Filtered to ${posts.length} original posts`);

  const outputPath = path.join(__dirname, "../src/data/x-posts.json");
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`Wrote ${posts.length} posts to ${outputPath}`);
}

main();
