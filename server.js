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

    const uid = req.query.uid;
    const incomingReward = req.query.reward || req.query.amount;
    const requestToken = req.query.token; // यूआरएल से टोकन पढ़ना

    // 1. सीक्रेट टोकन की जांच (हैकर्स को रोकने के लिए)
    // तुम रेंडर के Environment Variables में POSTBACK_SECRET नाम से अपना एक पासवर्ड सेट कर सकते हो
    const secureToken = process.env.POSTBACK_SECRET || "Yogesh@2026637584"; 
    
    if (!requestToken || requestToken !== secureToken) {
        console.log("⚠️ Unauthorized attempt blocked! Invalid Token.");
        return res.status(403).send("Forbidden: Invalid Secret Token");
    }

    if (!uid || !incomingReward) {
      console.log("❌ Rejected: Missing uid or reward data");
      return res.status(400).send("Missing data");
    }

    const reward = Number(incomingReward);

    // 🪙 सुरक्षित कॉइन कन्वर्ज़न रूल:
    // मान लो AdswedMedia डॉलर ($0.01) भेजता है, तो गुणा 100 होगा। 
    // लेकिन अगर वो सीधा पॉइंट्स/सेंट्स (जैसे 1 या 100) भेजता है, तो तुम गुणा हटाकर सीधा `Math.round(reward)` रख सकते हो।
    // अभी सुरक्षा के लिए हम इसे डॉलर सेंट्स के हिसाब से सेफ रख रहे हैं:
    let coins = Math.round(reward * 100);
    
    // सुरक्षा जांच: अगर गलती से अमाउंट 100 डॉलर (यानी 10000 कॉइन्स) आ जाए, तो उसे लिमिट करना
    if (coins > 500) { 
        console.log(`⚠️ Warning: असामान्य रूप से अधिक कॉइन्स (${coins}), इसे 500 पर लिमिट किया गया।`);
        coins = 500; 
    }

    if (coins <= 0) coins = 1;

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
