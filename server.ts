import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";

const db = new Database("dashboard.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS sliders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    title TEXT,
    description TEXT,
    images TEXT, -- JSON array of image URLs
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Seed default user if not exists
const userExists = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@example.com");
if (!userExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run("admin@example.com", hashedPassword);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Multer setup for image uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  });
  const upload = multer({ storage });

  // Auth Middleware (Disabled for testing)
  const authenticate = (req: any, res: any, next: any) => {
    next();
  };

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id: user.id, email: user.email } });
  });

  // CRUD for Sliders
  app.get("/api/sliders", (req, res) => res.json(db.prepare("SELECT * FROM sliders").all()));
  app.post("/api/sliders", authenticate, (req, res) => {
    const { title, image_url, description } = req.body;
    const result = db.prepare("INSERT INTO sliders (title, image_url, description) VALUES (?, ?, ?)").run(title, image_url, description);
    res.json({ id: result.lastInsertRowid });
  });
  app.put("/api/sliders/:id", authenticate, (req, res) => {
    const { title, image_url, description } = req.body;
    db.prepare("UPDATE sliders SET title = ?, image_url = ?, description = ? WHERE id = ?").run(title, image_url, description, req.params.id);
    res.json({ success: true });
  });
  app.delete("/api/sliders/:id", authenticate, (req, res) => {
    db.prepare("DELETE FROM sliders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // CRUD for Services
  app.get("/api/services", (req, res) => res.json(db.prepare("SELECT * FROM services").all()));
  app.post("/api/services", authenticate, (req, res) => {
    const { name, description, icon } = req.body;
    const result = db.prepare("INSERT INTO services (name, description, icon) VALUES (?, ?, ?)").run(name, description, icon);
    res.json({ id: result.lastInsertRowid });
  });
  app.put("/api/services/:id", authenticate, (req, res) => {
    const { name, description, icon } = req.body;
    db.prepare("UPDATE services SET name = ?, description = ?, icon = ? WHERE id = ?").run(name, description, icon, req.params.id);
    res.json({ success: true });
  });
  app.delete("/api/services/:id", authenticate, (req, res) => {
    db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // CRUD for Categories
  app.get("/api/categories", (req, res) => res.json(db.prepare("SELECT * FROM categories").all()));
  app.post("/api/categories", authenticate, (req, res) => {
    const { name } = req.body;
    const result = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    res.json({ id: result.lastInsertRowid });
  });
  app.put("/api/categories/:id", authenticate, (req, res) => {
    const { name } = req.body;
    db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, req.params.id);
    res.json({ success: true });
  });
  app.delete("/api/categories/:id", authenticate, (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // CRUD for Projects
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM projects p 
      JOIN categories c ON p.category_id = c.id
    `).all();
    res.json(projects.map((p: any) => ({ ...p, images: JSON.parse(p.images || "[]") })));
  });
  app.post("/api/projects", authenticate, (req, res) => {
    const { category_id, title, description, images } = req.body;
    const result = db.prepare("INSERT INTO projects (category_id, title, description, images) VALUES (?, ?, ?, ?)").run(category_id, title, description, JSON.stringify(images));
    res.json({ id: result.lastInsertRowid });
  });
  app.put("/api/projects/:id", authenticate, (req, res) => {
    const { category_id, title, description, images } = req.body;
    db.prepare("UPDATE projects SET category_id = ?, title = ?, description = ?, images = ? WHERE id = ?").run(category_id, title, description, JSON.stringify(images), req.params.id);
    res.json({ success: true });
  });
  app.delete("/api/projects/:id", authenticate, (req, res) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Image Upload Endpoint
  app.post("/api/upload", authenticate, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // Serve static files from public directory
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile(path.resolve("dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
