import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

function loadPlaywright() {
  const bundledModules = path.join(
    process.env.HOME ?? "",
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules",
  );

  try {
    return createRequire(`${bundledModules}/`)("playwright");
  } catch {
    return createRequire(import.meta.url)("playwright");
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function siteContentSavePlugin() {
  return {
    name: "site-content-save",
    configureServer(server) {
      server.middlewares.use("/__save-site-content", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            const content = JSON.parse(body);
            const filePath = path.resolve(process.cwd(), "src/content/siteContent.js");
            const file = `// Local Edit Mode can save directly back to this file in development.
// The floating editor also offers a JSON copy fallback if file saving is unavailable.
export const siteContent = ${JSON.stringify(content, null, 2)};
`;
            await fs.writeFile(filePath, file);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (error) {
            res.statusCode = 500;
            res.end(error instanceof Error ? error.message : "Unable to save content");
          }
        });
      });

      server.middlewares.use("/__capture-screenshot", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        try {
          const body = await readJsonBody(req);
          const targetUrl = new URL(body.url);
          const serverUrl = new URL(server.resolvedUrls.local[0]);

          if (targetUrl.origin !== serverUrl.origin) {
            res.statusCode = 400;
            res.end("Can only capture this local preview.");
            return;
          }

          const screenshotsDir = path.resolve(process.cwd(), "screenshots");
          await fs.mkdir(screenshotsDir, { recursive: true });
          const existingFiles = await fs.readdir(screenshotsDir);
          await Promise.all(
            existingFiles
              .filter((file) => file.endsWith(".png"))
              .map((file) => fs.unlink(path.join(screenshotsDir, file))),
          );

          const filename = "homepage.png";
          const filePath = path.join(screenshotsDir, filename);
          const { chromium } = loadPlaywright();
          const browser = await chromium.launch({ headless: true });
          const page = await browser.newPage({
            viewport: {
              width: Math.min(Math.max(Number(body.width) || 1440, 320), 2400),
              height: Math.min(Math.max(Number(body.height) || 1000, 480), 1800),
            },
            deviceScaleFactor: Math.min(Math.max(Number(body.deviceScaleFactor) || 1, 1), 2),
          });

          if (body.content) {
            await page.addInitScript(
              (draftContent) => {
                window.localStorage.setItem("lizzie-site-content-draft", JSON.stringify(draftContent));
              },
              body.content,
            );
          }

          await page.goto(targetUrl.toString(), { waitUntil: "networkidle" });
          await page.screenshot({ path: filePath, fullPage: true });
          await browser.close();

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, filename, path: filePath }));
        } catch (error) {
          res.statusCode = 500;
          res.end(error instanceof Error ? error.message : "Unable to capture screenshot");
        }
      });
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/lizzieprofile/" : "/",
  plugins: [react(), tailwindcss(), siteContentSavePlugin()],
});
