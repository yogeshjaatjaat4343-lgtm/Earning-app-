const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/postback", (req, res) => {
  res.send("Postback Ready");
});

app.listen(process.env.PORT || 3000);
