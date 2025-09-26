import dotenv from "dotenv";
dotenv.config();

console.log("1. Environment loaded");

import express from "express";
console.log("2. Express imported");

import cors from "cors";
console.log("3. CORS imported");

// Test Supabase connection
// import { supabase } from "./src/lib/supabase/supabase";
console.log("4. Supabase import commented out");

const app = express();
const port = process.env.PORT || 4000;

console.log("5. App created");

app.use(cors());
app.use(express.json());

console.log("6. Middleware added");

app.get("/", (_req, res) => {
  res.send("💼 OFFER-HUB backend is up and running!");
});

console.log("7. Routes defined");

app.listen(port, () => {
  console.log(`🚀 OFFER-HUB server is live at http://localhost:${port}`);
  console.log("🌐 Connecting freelancers and clients around the world...");
  console.log("✅ Working...");
});

console.log("8. Server starting...");
