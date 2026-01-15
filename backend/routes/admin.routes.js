const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middelware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();


router.get("/dashboard", verifyToken, allowRoles("ADMIN"), (req, res) => {
  const data = {};

  db.query("SELECT COUNT(*) users FROM users", (e, u) => {
    data.users = u[0].users;

    db.query("SELECT COUNT(*) stores FROM stores", (e, s) => {
      data.stores = s[0].stores;

      db.query("SELECT COUNT(*) ratings FROM ratings", (e, r) => {
        data.ratings = r[0].ratings;
        res.json(data);
      });
    });
  });
});

router.get("/users", verifyToken, allowRoles("ADMIN"), (req, res) => {
  const { name, email, address, role } = req.query;
  let query = "SELECT id,name,email,address,role FROM users";
  const conditions = [];
  const params = [];
  if (name) {
    conditions.push("name LIKE ?");
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push("email LIKE ?");
    params.push(`%${email}%`);
  }
  if (address) {
    conditions.push("address LIKE ?");
    params.push(`%${address}%`);
  }
  if (role) {
    conditions.push("role = ?");
    params.push(role);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  db.query(query, params, (e, r) => {
    res.json(r);
  });
});

router.get("/users/:id", verifyToken, allowRoles("ADMIN"), (req, res) => {
  const userId = req.params.id;
  db.query(
    `SELECT u.id,u.name,u.email,u.address,u.role,
      (SELECT AVG(r.rating) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = u.id) as rating
     FROM users u WHERE u.id = ?`,
    [userId],
    (e, r) => res.json(r[0])
  );
});

router.post("/users", verifyToken, allowRoles("ADMIN"), async (req, res) => {
  const { name, email, password, address, role } = req.body;
  
  if (!name || !email || !password || !address) {
    return res
      .status(400)
      .json("All fields (name, email, password, address) are required");
  }

  
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length > 0)
        return res.status(400).json("Email already exists");

      const hashed = await bcrypt.hash(password, 10);
      db.query(
        "INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)",
        [name, email, hashed, address, role || "USER"],
        (err) => {
          if (err) return res.status(400).json(err);
          res.json("User added");
        }
      );
    }
  );
});


router.get("/stores", verifyToken, allowRoles("ADMIN"), (req, res) => {
  db.query(
    `SELECT s.*, u.name as ownerName, u.email as ownerEmail, AVG(r.rating) as avgRating
     FROM stores s
     LEFT JOIN users u ON s.owner_id = u.id
     LEFT JOIN ratings r ON s.id = r.store_id
     GROUP BY s.id`,
    (e, r) => res.json(r)
  );
});


router.post("/stores", verifyToken, allowRoles("ADMIN"), (req, res) => {
  const { name, email, address, owner_id } = req.body;
  if (!name || !email || !address || !owner_id)
    return res
      .status(400)
      .json("All fields (name, email, address, owner_id) are required");

  db.query("SELECT id FROM users WHERE id = ?", [owner_id], (err, owners) => {
    if (err) return res.status(500).json(err);
    if (owners.length === 0) return res.status(400).json("Owner ID not found");

    db.query(
      "INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)",
      [name, email, address, owner_id],
      (e) => {
        if (e) return res.status(400).json(e);
        return res.json("Store added");
      }
    );
  });
});

module.exports = router;
