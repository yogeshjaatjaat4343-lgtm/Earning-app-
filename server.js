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
  res.send("Backend Running");
});

app.get("/postback", async (req, res) => {

  try {

    const clickId = req.query.click_id || req.query.unique_id;

    const reward = Number(req.query.reward);

    if (!uid || !reward) {
      return res.status(400).send("Missing data");
    }

    const coins = Math.floor(reward * 0.7);

    await db.collection("users").doc(uid).update({
      coins: admin.firestore.FieldValue.increment(coins)
    });

    res.send("Coins Added");

  } catch (e) {
    
   console.log(e);
    
    res.status(500).send("Error");

  }

});

app.listen(process.env.PORT || 3000);
