import express from "express";
import http from "http";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const PYTHON_PORT = 5001;

app.use(express.json());

// Spawn Python blockchain server if not already running
let pythonProcess: ChildProcess | null = null;

function startPythonServer() {
  try {
    pythonProcess = spawn("python3", ["python_server.py"], {
      stdio: "inherit",
      env: { ...process.env, PYTHON_SERVER_PORT: String(PYTHON_PORT) }
    });

    pythonProcess.on("error", (err) => {
      console.error("[Python Server] Failed to start:", err);
    });

    pythonProcess.on("exit", (code) => {
      console.log(`[Python Server] Exited with code ${code}. Restarting in 2s...`);
      setTimeout(startPythonServer, 2000);
    });
  } catch (err) {
    console.error("[Python Server] Spawn error:", err);
  }
}

startPythonServer();

// Clean up child process on exit
process.on("exit", () => {
  if (pythonProcess) pythonProcess.kill();
});
process.on("SIGINT", () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});
process.on("SIGTERM", () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});

// Proxy helper to Python Blockchain Engine
function proxyToPython(req: express.Request, res: express.Response) {
  const reqHeaders = { ...req.headers };
  delete reqHeaders.connection;
  delete reqHeaders["keep-alive"];
  delete reqHeaders["transfer-encoding"];
  delete reqHeaders.host;

  const options: http.RequestOptions = {
    hostname: "127.0.0.1",
    port: PYTHON_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...reqHeaders,
      host: `127.0.0.1:${PYTHON_PORT}`,
      connection: "close"
    },
    agent: false,
    timeout: 8000
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 200);
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    }
    proxyRes.pipe(res);
  });

  proxyReq.on("timeout", () => {
    proxyReq.destroy();
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.status(504).json({
        error: "Gateway Timeout: Blockchain service did not respond in time."
      });
    }
  });

  proxyReq.on("error", (err) => {
    console.error(`[API Proxy Error] ${req.method} ${req.originalUrl}:`, err.message);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.status(503).json({
        error: "Python Blockchain service initializing, please retry shortly.",
        detail: err.message
      });
    }
  });

  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }

  proxyReq.end();
}

// Route all /api/* requests directly through proxy to Python Blockchain Engine
app.use("/api", (req, res) => {
  proxyToPython(req, res);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VERICERT] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
