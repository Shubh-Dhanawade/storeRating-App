const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyToken } = require("../middelware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password, address , role) VALUES (?,?,?,?, ?)",
    [name, email, hashedPassword, address, role],
    (err) => {
      if (err) return res.status(400).json(err);
      res.json({ message: `${role} registered` });
    }
  );
});

router.put("/password", verifyToken, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json("Password required");
  const hashed = await bcrypt.hash(password, 10);
  db.query(
    "UPDATE users SET password=? WHERE id=?",
    [hashed, req.user.id],
    (err) => {
      if (err) return res.status(400).json(err);
      res.json("Password updated");
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (result.length === 0) return res.status(401).json("User not found");

      const valid = await bcrypt.compare(password, result[0].password);
      if (!valid) return res.status(401).json("Invalid password");

      const token = jwt.sign(
        { id: result[0].id, role: result[0].role },
        "SECRET_KEY"
      );

      res.json({ token, role: result[0].role });
    }
  );
});

module.exports = router;
