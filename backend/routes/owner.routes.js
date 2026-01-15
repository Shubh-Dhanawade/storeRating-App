const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middelware/auth");

const router = express.Router();

router.get("/dashboard", verifyToken, allowRoles("OWNER"), (req, res) => {
  db.query(
    `SELECT u.name, r.rating
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     JOIN stores s ON s.id = r.store_id
     WHERE s.owner_id = ?`,
    [req.user.id],
    (e, r) => res.json(r)
  );
});

router.get("/average-rating", verifyToken, allowRoles("OWNER"), (req, res) => {
  db.query(
    `SELECT AVG(r.rating) avgRating
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE s.owner_id = ?`,
    [req.user.id],
    (e, r) => res.json(r[0])
  );
});

module.exports = router;
