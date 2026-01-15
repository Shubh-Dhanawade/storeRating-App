const express = require("express");
const db = require("../db");
const { verifyToken } = require("../middelware/auth");

const router = express.Router();

router.post("/", verifyToken, (req, res) => {
  const { store_id, rating } = req.body;
  const user_id = req.user.id;
  const num = Number(rating);
  if (!store_id || !num || num < 1 || num > 5)
    return res.status(400).json("Rating must be between 1 and 5");

  db.query(
    "REPLACE INTO ratings (user_id, store_id, rating) VALUES (?,?,?)",
    [user_id, store_id, num],
    () => res.json("Rating submitted")
  );
});

module.exports = router;
