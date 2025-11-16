import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 0️⃣ Access Protection Middleware
app.use((req, res, next) => {

  // Always allow loader API
  if (req.path.startsWith("/frontend-loader")) return next();

  // Always allow static assets
  if (
    req.path.startsWith("/css") ||
    req.path.startsWith("/js") ||
    req.path.startsWith("/images") ||
    req.path.startsWith("/assets")
  ) return next();

  // Allow only if loader flag exists
  if (req.query.loader === "true") {
    return next();
  }

  return res
    .status(403)
    .send("<h2>403 - Access Restricted</h2><p>Not allowed directly.</p>");
});

// 1️⃣ Serve Static Website
app.use(express.static(path.join(__dirname, "public")));

// 2️⃣ Loader API
app.get("/frontend-loader", (req, res) => {
  res.json({
    allowed: true,
    code: "console.log('Loaded through loader');"
  });
});

// 3️⃣ Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
