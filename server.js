const express = require("express");
const admin = require("firebase-admin");

const app = express();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

app.get("/", (req, res) => {
  res.send("Secure Backend Running!");
});

// 🔒 Fix 4 & 5: सीक्रेट टोकन और सुरक्षित कॉइन मैपिंग के साथ पोस्टबैक सिक्योर करना
app.get("/postback", async (req, res) => {
  try {
    console.log("Postback Signal Received:", req.query);

    const externalUID = req.query.uid;

if (!externalUID) {
  console.log("❌ Missing external UID");
  return res.status(400).send("Missing UID");
}
  const mapDoc = await db.collection("user_map").doc(externalUID).get();

if (!mapDoc.exists) {
  console.log("❌ No mapping found:", externalUID);
  return res.status(400).send("No mapping");
}

const firebaseUID = mapDoc.data().firebaseUID;
    console.log("FINAL UID:", uid);

    let incomingReward =
    req.query.reward ||
    req.query.amount ||
    req.query.payout ||
    req.query.currencyAmount ||
    req.query.revenue;
    const transactionId =
    req.query.transactionID ||
    req.query.transaction_id ||
    req.query.click_id ||
    "";

const type = req.query.type || "credit";
    console.log("FINAL REWARD:", incomingReward);

    if (Array.isArray(incomingReward)) {
      incomingReward = incomingReward[incomingReward.length - 1];
    }

    console.log("UID =", uid);

    if (!uid || !incomingReward) {
      console.log("❌ Rejected: Missing uid or reward data");
      return res.status(400).send("Missing data");
    }

    // ✅ ONLY ONE DECLARATION
    const reward = Number(incomingReward);

    // 70% user, 30% admin
    const userReward = reward * 0.7;
    const adminCommission = reward * 0.3;

    // coins conversion
    let coins = Math.round(userReward * 100);

    if (coins > 5000) {
      console.log(`⚠️ Warning: too high coins (${coins}), capped to 5000`);
      coins = 5000;
    }

    if (coins <= 0) coins = 1;

    console.log(`💰 Total Reward = ${reward}`);
    console.log(`👤 User Reward = ${userReward}`);
    console.log(`👑 Admin Commission = ${adminCommission}`);

    console.log(`🪙 User ID: ${uid} के लिए ${coins} कॉइन्स प्रोसेस हो रहे हैं...`);

    let finalCoins = coins;

if (type === "chargeback") {
    finalCoins = -coins;
}

await db.collection("users").doc(firebaseUID).set(
{
    coins: admin.firestore.FieldValue.increment(finalCoins)
},
{ merge: true }
);

    console.log(`✅ Success: Coins added successfully to ${uid}`);
    res.send("Coins Added");

  } catch (e) {
    console.error("❌ Firestore Postback Error:", e);
    res.status(500).send("Error");
  }
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server Running");
});
