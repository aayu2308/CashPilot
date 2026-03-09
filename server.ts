import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateFinancialInsights } from "./src/services/geminiService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cashpilot.db");
const JWT_SECRET = process.env.JWT_SECRET || "cashpilot-super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_checkin TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'income' or 'expense'
    category TEXT,
    amount REAL,
    description TEXT,
    date TEXT,
    is_recurring INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    target_amount REAL,
    current_amount REAL DEFAULT 0,
    monthly_contribution REAL,
    deadline TEXT,
    category TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    amount REAL,
    billing_cycle TEXT, -- 'monthly' or 'yearly'
    next_billing TEXT,
    category TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    amount REAL,
    due_date TEXT,
    status TEXT DEFAULT 'unpaid',
    is_emi INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
      const info = stmt.run(email, hashedPassword, name);
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: info.lastInsertRowid, email, name } });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, points: user.points, streak: user.streak } });
  });

  // --- Transaction Routes ---
  app.get("/api/transactions", authenticateToken, (req: any, res) => {
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", authenticateToken, (req: any, res) => {
    const { type, category, amount, description, date, is_recurring } = req.body;
    const stmt = db.prepare("INSERT INTO transactions (user_id, type, category, amount, description, date, is_recurring) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const info = stmt.run(req.user.id, type, category, amount, description, date, is_recurring ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  // --- Goal Routes ---
  app.get("/api/goals", authenticateToken, (req: any, res) => {
    const goals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(req.user.id);
    res.json(goals);
  });

  app.post("/api/goals", authenticateToken, (req: any, res) => {
    const { name, target_amount, monthly_contribution, deadline, category } = req.body;
    const stmt = db.prepare("INSERT INTO goals (user_id, name, target_amount, monthly_contribution, deadline, category) VALUES (?, ?, ?, ?, ?, ?)");
    const info = stmt.run(req.user.id, name, target_amount, monthly_contribution, deadline, category);
    res.json({ id: info.lastInsertRowid });
  });

  // --- Insights Route ---
  app.get("/api/dashboard/insights", authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    const stats = db.prepare(`
      SELECT type, category, SUM(amount) as total 
      FROM transactions 
      WHERE user_id = ? 
      GROUP BY type, category
    `).all(userId);
    
    const insights = await generateFinancialInsights(stats);
    res.json(insights);
  });

  // --- Check-in Route ---
  app.post("/api/user/checkin", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    const today = new Date().toISOString().split('T')[0];
    
    if (user.last_checkin === today) {
      return res.json({ message: "Already checked in today", streak: user.streak });
    }

    let newStreak = 1;
    if (user.last_checkin) {
      const lastDate = new Date(user.last_checkin);
      const diff = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) newStreak = user.streak + 1;
    }

    db.prepare("UPDATE users SET streak = ?, last_checkin = ?, points = points + 10 WHERE id = ?")
      .run(newStreak, today, userId);
    
    res.json({ streak: newStreak, points: user.points + 10 });
  });

  // --- Dashboard Stats ---
  app.get("/api/dashboard/stats", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    
    const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'income'").get(userId) as any;
    const expenses = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense'").get(userId) as any;
    
    const expensesToday = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date = ?").get(userId, today) as any;
    const savingsMonth = db.prepare(`
      SELECT (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as total 
      FROM transactions 
      WHERE user_id = ? AND date LIKE ?
    `).get(userId, `${currentMonth}%`) as any;

    const upcomingBills = db.prepare("SELECT SUM(amount) as total FROM bills WHERE user_id = ? AND status = 'unpaid'").get(userId) as any;

    const savings = (income.total || 0) - (expenses.total || 0);
    
    const categoryStats = db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE user_id = ? AND type = 'expense' 
      GROUP BY category
    `).all(userId);

    const rawMonthlyTrend = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total
      FROM transactions
      WHERE user_id = ?
      GROUP BY month, type
      ORDER BY month ASC
    `).all(userId) as any[];

    const monthlyTrendMap = new Map();
    rawMonthlyTrend.forEach(item => {
      if (!monthlyTrendMap.has(item.month)) {
        monthlyTrendMap.set(item.month, { month: item.month, income: 0, expense: 0 });
      }
      const monthData = monthlyTrendMap.get(item.month);
      if (item.type === 'income') monthData.income = item.total;
      else if (item.type === 'expense') monthData.expense = item.total;
    });

    const monthlyTrend = Array.from(monthlyTrendMap.values());

    res.json({
      totalIncome: income.total || 0,
      totalExpenses: expenses.total || 0,
      totalSavings: savings,
      totalExpensesToday: expensesToday.total || 0,
      totalSavingsMonth: savingsMonth.total || 0,
      upcomingBillsTotal: upcomingBills.total || 0,
      categoryStats,
      monthlyTrend,
      healthScore: Math.min(100, Math.max(0, Math.round((savings / (income.total || 1)) * 100)))
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
