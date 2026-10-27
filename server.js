import express from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import {
  initStorage,
  getAudioRegistry,
  getAudioFilePath,
  saveUploadedAudio,
  updateAudioStatus,
  removeAudio,
  verifyTeacherPasscode,
  isValidTeacherToken,
  getSharedLeaderboard,
  submitLeaderboardScore
} from "./src/server/storageManager";
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
const isProduction = process.env.NODE_ENV === "production";
initStorage();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/x-m4a", "audio/mp4", "audio/aac"];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid audio file type. Only MP3, WAV, OGG, and WebM are allowed."));
    }
  }
});
function requireTeacherAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : void 0;
  if (!isValidTeacherToken(token)) {
    res.status(401).json({ error: "Unauthorized: Teacher access token required." });
    return;
  }
  next();
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Football Phonics Academy Cloud Audio", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/teacher/auth", (req, res) => {
  const { passcode } = req.body;
  if (!passcode || typeof passcode !== "string") {
    res.status(400).json({ error: "Passcode is required." });
    return;
  }
  const result = verifyTeacherPasscode(passcode);
  if (result.success) {
    res.json({ success: true, token: result.token });
  } else {
    res.status(401).json({ success: false, error: result.error });
  }
});
app.get("/api/audio/registry", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  const registry = getAudioRegistry();
  res.json(registry);
});
app.get("/api/audio/stream/:category/:file", (req, res) => {
  const { category, file } = req.params;
  if (!["phonemes", "words"].includes(category)) {
    res.status(400).send("Invalid audio category.");
    return;
  }
  const filePath = getAudioFilePath(`${category}/${file}`);
  if (!filePath) {
    res.status(404).send("Audio not found.");
    return;
  }
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const range = req.headers.range;
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".webm": "audio/webm",
    ".m4a": "audio/x-m4a"
  };
  const contentType = mimeMap[ext] || "audio/mpeg";
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=86400");
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const partialstart = parseInt(parts[0], 10);
    const partialend = parts[1] ? parseInt(parts[1], 10) : total - 1;
    const start = isNaN(partialstart) ? 0 : partialstart;
    const end = isNaN(partialend) ? total - 1 : partialend;
    const chunksize = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Content-Length": chunksize,
      "Content-Type": contentType
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": total,
      "Content-Type": contentType
    });
    fs.createReadStream(filePath).pipe(res);
  }
});
app.post("/api/audio/upload", requireTeacherAuth, upload.single("audioFile"), (req, res) => {
  try {
    const { id, category, isVerified, base64Data, filename } = req.body;
    if (!id || !category || !["phonemes", "words"].includes(category)) {
      res.status(400).json({ error: "Missing or invalid id/category parameters." });
      return;
    }
    let buffer;
    let finalFilename = filename || `${id}.mp3`;
    let mimeType = "audio/mpeg";
    if (req.file) {
      buffer = req.file.buffer;
      finalFilename = req.file.originalname || finalFilename;
      mimeType = req.file.mimetype;
    } else if (base64Data) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }
      if (!filename) {
        const ext = mimeType.includes("wav") ? "wav" : mimeType.includes("webm") ? "webm" : "mp3";
        finalFilename = `${id}.${ext}`;
      }
    } else {
      res.status(400).json({ error: "No audio file or data provided." });
      return;
    }
    const entry = saveUploadedAudio(
      id,
      category,
      finalFilename,
      buffer,
      mimeType,
      isVerified === "true" || isVerified === true
    );
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to save audio file." });
  }
});
app.post("/api/audio/verify", requireTeacherAuth, (req, res) => {
  const { id, status } = req.body;
  if (!id || !["verified_cloud", "unverified_cloud", "missing"].includes(status)) {
    res.status(400).json({ error: "Invalid id or verification status." });
    return;
  }
  const updated = updateAudioStatus(id, status);
  if (updated) {
    res.json({ success: true, entry: updated });
  } else {
    res.status(404).json({ error: "Audio item not found." });
  }
});
app.delete("/api/audio/:id", requireTeacherAuth, (req, res) => {
  const { id } = req.params;
  const success = removeAudio(id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Audio item not found." });
  }
});
app.get("/api/leaderboard", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  const list = getSharedLeaderboard();
  res.json(list);
});
app.post("/api/leaderboard", (req, res) => {
  const { id, name, totalPoints, phonicsAccuracy, goalsScored, gamesCompleted, badgesCount } = req.body;
  if (!name || typeof totalPoints !== "number") {
    res.status(400).json({ error: "Invalid leaderboard payload." });
    return;
  }
  const updatedList = submitLeaderboardScore({
    id: id || `p_${Date.now()}`,
    name,
    totalPoints,
    phonicsAccuracy: phonicsAccuracy || 0,
    goalsScored: goalsScored || 0,
    gamesCompleted: gamesCompleted || 0,
    badgesCount: badgesCount || 0
  });
  res.json({ success: true, leaderboard: updatedList });
});
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Football Phonics Academy] Server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
