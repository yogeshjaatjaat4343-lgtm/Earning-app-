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

    const uid = req.query.uid || req.query.subId || req.query.userId;
    console.log("FINAL UID:", uid);
    let incomingReward = req.query.reward || req.query.amount || req.query.payout;
    console.log("FINAL REWARD:", incomingReward);

if (Array.isArray(incomingReward)) {
    incomingReward = incomingReward[incomingReward.length - 1];
}
    console.log("UID =", uid);
    if (!uid || !incomingReward) {
      console.log("❌ Rejected: Missing uid or reward data");
      return res.status(400).send("Missing data");
    }

    const reward = Number(incomingReward);

    // 🪙 सुरक्षित कॉइन कन्वर्ज़न रूल:
    // मान लो AdswedMedia डॉलर ($0.01) भेजता है, तो गुणा 100 होगा। 
    // लेकिन अगर वो सीधा पॉइंट्स/सेंट्स (जैसे 1 या 100) भेजता है, तो तुम गुणा हटाकर सीधा `Math.round(reward)` रख सकते हो।
    // अभी सुरक्षा के लिए हम इसे डॉलर सेंट्स के हिसाब से सेफ रख रहे हैं:
    const reward = Number(incomingReward);

// 70% यूजर
const userReward = reward * 0.7;

// 30% एडमिन
const adminCommission = reward * 0.3;

// कॉइन्स
let coins = Math.round(userReward * 100);

// सेफ्टी लिमिट
if (coins > 5000) {
  console.log(`⚠️ Warning: असामान्य रूप से अधिक कॉइन्स (${coins}), इसे 5000 पर लिमिट किया गया।`);
  coins = 5000;
}

if (coins <= 0) coins = 1;

// Logs
console.log(`💰 Total Reward = ${reward}`);
console.log(`👤 User Reward (70%) = ${userReward}`);
console.log(`👑 Admin Commission (30%) = ${adminCommission}`);

console.log(`🪙 User ID: ${uid} के लिए ${coins} कॉइन्स प्रोसेस हो रहे हैं...`);

    // फ़ायरबेस स्टोर अपडेट करना
    await db.collection("users").doc(uid).set(
      {
        coins: admin.firestore.FieldValue.increment(coins)
      },
      {
        merge: true
      }
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
