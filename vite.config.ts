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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE ?? (mode === "production" ? "/portfolio/" : "/");
  const outDir = process.env.VITE_OUT_DIR ?? "docs";

  return {
    base,
    plugins: [inspectAttr(), react(), createPortfolioJsonEditorPlugin()],
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
