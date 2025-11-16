import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Fix ES module file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------
// 1️⃣ PROTECTION MIDDLEWARE
// -------------------------------------------------
app.use((req, res, next) => {
  // Always allow static files (CSS, JS, images, fonts, etc.)
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|json|txt|mp4|mp3|woff|woff2|ttf|otf)$/i)) {
    return next();
  }

  // Allow loader API
  if (req.path.startsWith("/frontend-loader")) {
    return next();
  }

  // Check if user is authorized via header or cookie
  const fromLoader =
    req.headers["x-from-loader"] === "true" ||
    req.cookies.fromLoader === "true";

  // If not authorized → block access
  if (!fromLoader) {
    return res.status(403).send(`
      <h2>403 Access Restricted</h2>
      <p>You cannot open this website directly.</p>
    `);
  }

  next();
});

// -------------------------------------------------
// 2️⃣ SERVE STATIC WEBSITE FROM /public
// -------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

// -------------------------------------------------
// 3️⃣ FRONTEND LOADER API
// -------------------------------------------------
app.get("/frontend-loader", (req, res) => {
  const code = `
    console.log("Loaded through secure loader");
    document.cookie = "fromLoader=true; path=/;";
  `;
  
  res.json({ allowed: true, code });
});

// -------------------------------------------------
// 4️⃣ FALLBACK ROUTE (SERVES index.html FOR ANY HTML PATH)
// -------------------------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
