import path from "path"
import fs from "fs/promises"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from "kimi-plugin-inspect-react"

const portfolioJsonFilePath = path.resolve(__dirname, "./src/data/portfolio.json");

function createPortfolioJsonEditorPlugin(): Plugin {
  const endpointPath = "/__portfolio-json";

  const requestListener = async (req: { method?: string; url?: string; on: (event: string, callback: (chunk?: Buffer) => void) => void }, res: { setHeader: (name: string, value: string) => void; statusCode: number; end: (body?: string) => void }) => {
    const requestPath = req.url?.split("?")[0] ?? "";

    if (requestPath !== endpointPath) {
      return false;
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method === "GET") {
      try {
        const text = await fs.readFile(portfolioJsonFilePath, "utf8");
        res.statusCode = 200;
        res.end(text);
      } catch {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Failed to read src/data/portfolio.json" }));
      }

      return true;
    }

    if (req.method === "PUT") {
      const chunks: Buffer[] = [];

      req.on("data", (chunk?: Buffer) => {
        if (chunk) {
          chunks.push(chunk);
        }
      });

      req.on("end", async () => {
        try {
          const bodyText = Buffer.concat(chunks).toString("utf8");
          const parsed = JSON.parse(bodyText) as unknown;
          const formatted = JSON.stringify(parsed, null, 2);
          await fs.writeFile(portfolioJsonFilePath, `${formatted}\n`, "utf8");

          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Invalid JSON payload or file write failed" }));
        }
      });

      return true;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return true;
  };

  return {
    name: "portfolio-json-editor-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await requestListener(req, res);

        if (!handled) {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await requestListener(req, res);

        if (!handled) {
          next();
        }
      });
    },
  };
}

function copyAssetsToOutputPlugin(outDir: string): Plugin {
  const assetsSourceDir = path.resolve(__dirname, "./src/Assets")
  const assetsTargetDir = path.resolve(__dirname, `./${outDir}/src/Assets`)

  return {
    name: "copy-assets-to-output",
    async writeBundle() {
      try {
        await fs.mkdir(path.dirname(assetsTargetDir), { recursive: true })
        await fs.cp(assetsSourceDir, assetsTargetDir, { recursive: true, force: true })
      } catch (error) {
        console.error("Failed to copy src/Assets to build output:", error)
      }
    },
  }
}

function createLegacyRedirectPlugin(outDir: string): Plugin {
  const legacyIndexPath = path.resolve(__dirname, `./${outDir}/portfolio/index.html`)
  const redirectHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=/" />
    <script>
      const redirectTarget = window.location.origin + "/";
      window.location.replace(redirectTarget);
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/">omar92.github.io</a>...</p>
  </body>
</html>
`

  return {
    name: "create-legacy-portfolio-redirect",
    async writeBundle() {
      try {
        await fs.mkdir(path.dirname(legacyIndexPath), { recursive: true })
        await fs.writeFile(legacyIndexPath, redirectHtml, "utf8")
      } catch (error) {
        console.error("Failed to create legacy redirect page:", error)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => {
  const base = process.env.VITE_BASE ?? "/";
  const outDir = process.env.VITE_OUT_DIR ?? "docs";

  return {
    base,
    plugins: [inspectAttr(), react(), createPortfolioJsonEditorPlugin(), copyAssetsToOutputPlugin(outDir), createLegacyRedirectPlugin(outDir)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
    },
  };
});
