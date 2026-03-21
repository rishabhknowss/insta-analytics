// Quick script to test Instagram API with the stored access token
const DB_URL = process.env.DATABASE_URL;

async function main() {
  // Use pg to get the access token from DB
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  
  const res = await client.query('SELECT id, username, "accessToken" FROM accounts ORDER BY "lastSeenAt" DESC LIMIT 1');
  await client.end();
  
  if (res.rows.length === 0) {
    console.log("No accounts in DB");
    return;
  }
  
  const { id, username, accessToken } = res.rows[0];
  console.log(`Account: ${id} (${username})`);
  console.log(`Token: ${accessToken.slice(0, 20)}...`);
  
  // Test 1: Profile
  console.log("\n--- Test 1: Profile ---");
  const profileRes = await fetch(`https://graph.instagram.com/v25.0/${id}?fields=id,username&access_token=${accessToken}`);
  const profileText = await profileRes.text();
  console.log(`Status: ${profileRes.status}`);
  console.log(`Response: ${profileText.slice(0, 300)}`);
  
  // Test 2: Media list
  console.log("\n--- Test 2: Media ---");
  const mediaRes = await fetch(`https://graph.instagram.com/v25.0/${id}/media?fields=id,caption,media_type,media_product_type,thumbnail_url,permalink&limit=5&access_token=${accessToken}`);
  const mediaText = await mediaRes.text();
  console.log(`Status: ${mediaRes.status}`);
  console.log(`Response: ${mediaText.slice(0, 500)}`);
  
  // Test 3: Insights (if media exists)
  if (mediaRes.ok) {
    const mediaData = JSON.parse(mediaText);
    if (mediaData.data && mediaData.data.length > 0) {
      const firstMedia = mediaData.data[0];
      console.log(`\n--- Test 3: Insights for ${firstMedia.id} ---`);
      const insightsRes = await fetch(`https://graph.instagram.com/v25.0/${firstMedia.id}/insights?metric=views,likes,comments&access_token=${accessToken}`);
      const insightsText = await insightsRes.text();
      console.log(`Status: ${insightsRes.status}`);
      console.log(`Response: ${insightsText.slice(0, 500)}`);
    }
  }
}

main().catch(console.error);
