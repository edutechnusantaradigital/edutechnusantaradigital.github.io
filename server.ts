import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    // Development Mode using Vite Dev Server Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use "custom" to let us handle routes ourselves
    });

    // 1. Serve landing page files explicitly so they bypass Vite's index.html default routing
    app.get("/", (req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });
    
    app.get("/tentang", (req, res) => {
      res.sendFile(path.join(process.cwd(), "tentang.html"));
    });
    
    app.get("/layanan", (req, res) => {
      res.sendFile(path.join(process.cwd(), "layanan.html"));
    });

    app.get("/layanan/ojs", (req, res) => {
      res.sendFile(path.join(process.cwd(), "layanan/ojs/index.html"));
    });

    app.get("/portofolio", (req, res) => {
      res.sendFile(path.join(process.cwd(), "portofolio.html"));
    });

    app.get("/kontak", (req, res) => {
      res.sendFile(path.join(process.cwd(), "kontak.html"));
    });

    app.get("/login", (req, res) => {
      res.redirect("/login.html");
    });

    // Serve other root static HTML files
    app.get("/*.html", (req, res, next) => {
      const file = path.join(process.cwd(), req.path);
      if (fs.existsSync(file)) {
        return res.sendFile(file);
      }
      next();
    });

    // Serve root level static assets directly
    app.use("/assets", express.static(path.join(process.cwd(), "assets")));

    // 2. Use Vite's middlewares for CRM app, HMR, React components, and assets
    app.use(vite.middlewares);

    // Fallback for SPA routing of CRM paths inside login.html
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      // If it looks like a file/asset request, let the middleware or next handle it
      if (url.includes(".") && !url.endsWith(".html")) {
        return next();
      }
      try {
        // Read index template (which is our login.html at root)
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "login.html"),
          "utf-8"
        );
        // HTML transform by Vite (injects dev scripts)
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");

    // Serve all files from the built dist folder
    app.use(express.static(distPath));

    // Redirect /login to /login.html
    app.get("/login", (req, res) => {
      res.redirect("/login.html");
    });

    // Serve static HTML pages (without .html extension if requested)
    app.get("/tentang", (req, res) => {
      res.sendFile(path.join(distPath, "tentang.html"));
    });
    app.get("/layanan", (req, res) => {
      res.sendFile(path.join(distPath, "layanan.html"));
    });
    app.get("/layanan/ojs", (req, res) => {
      res.sendFile(path.join(distPath, "layanan/ojs/index.html"));
    });
    app.get("/portofolio", (req, res) => {
      res.sendFile(path.join(distPath, "portofolio.html"));
    });
    app.get("/kontak", (req, res) => {
      res.sendFile(path.join(distPath, "kontak.html"));
    });

    // Fallback for CRM SPA routing (anything else serves login.html)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "login.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
