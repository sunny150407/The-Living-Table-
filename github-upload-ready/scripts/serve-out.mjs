import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.join(process.cwd(), "out");
const port = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(root, "404.html");
    res.statusCode = 404;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  res.setHeader("Content-Type", mime);
  res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable");

  const raw = fs.readFileSync(filePath);
  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  const compressible = /\.(html|css|js|json|txt|svg)$/.test(ext);

  if (compressible && acceptEncoding.includes("gzip")) {
    res.setHeader("Content-Encoding", "gzip");
    res.end(zlib.gzipSync(raw));
  } else {
    res.end(raw);
  }
});

server.listen(port, () => {
  console.log(`Static production server with Gzip running at http://localhost:${port}`);
});
