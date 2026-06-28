const express = require("express");
const admin = require("firebase-admin");

const app = express();

// JSON + form support
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Firebase Init (FIXED)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Secure Earning Server Running!");
});

// 🔒 POSTBACK ENDPOINT (SECURE)
app.all("/postback", async (req, res) => {
  try {
    const data = req.method === "POST" ? req.body : req.query;

    console.log("📩 Postback Received:", data);

    // UID mapping (safe)
    const uid =
      data.uid ||
      data.subId ||
      data.userId ||
      data.uuid ||
      data.external_id;

    if (!uid) {
      console.log("❌ Missing UID");
      return res.status(400).send("Missing UID");
    }

    // reward parsing
    const rewardRaw = data.reward || data.amount || data.payout;

    const reward = parseFloat(rewardRaw);

    if (isNaN(reward) || reward <= 0) {
      console.log("❌ Invalid reward");
      return res.status(400).send("Invalid reward");
    }

    // 💰 split logic
    const userReward = reward * 0.7;
    const adminCommission = reward * 0.3;

    // 🪙 coins conversion
    let coins = Math.round(userReward * 100);

    // safety cap
    if (coins > 5000) coins = 5000;
    if (coins < 1) coins = 1;

    console.log("👤 UID:", uid);
    console.log("💰 Reward:", reward);
    console.log("🪙 Coins:", coins);

    // 🔥 Firestore update (safe)
    await db.collection("users").doc(uid).set(
      {
        coins: admin.firestore.FieldValue.increment(coins),
        lastPostback: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ Coins added successfully");

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).send("Error");
  }
});

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
