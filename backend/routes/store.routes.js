const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, "SECRET_KEY");
      userId = decoded.id;
    } catch (e) {
      userId = null;
    }
  }

  db.query(
    `SELECT s.*, AVG(r.rating) as avgRating, MAX(ur.rating) as userRating
     FROM stores s
     LEFT JOIN ratings r ON s.id = r.store_id
     LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
     GROUP BY s.id`,
    [userId],
    (err, result) => {
      res.json(result);
    }
  );
});

module.exports = router;
