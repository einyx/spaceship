import { resolve } from "node:path"
import { defineConfig } from "vite"

// Two builds, chosen with MODE=lib|page:
//   lib  the dashboard imports this as an es module and gives it the text of Prysm's chat
//   page the app the way the upstream ships it, on its own
const lib = process.env.MODE !== "page"

export default defineConfig(
  lib
    ? {
        build: {
          lib: {
            entry: resolve(import.meta.dirname, "src/text/main.ts"),
            formats: ["es"],
            fileName: () => "space.js",
          },
          cssCodeSplit: false,
          rollupOptions: {
            output: {
              assetFileNames: (info) => (info.names?.[0].startsWith("space") ? "space.css" : "assets/[name]-[hash][extname]"),
            },
          },
        },
      }
    : {
        base: "/spaceship/",
        build: {
          rollupOptions: {
            input: {
              main: resolve(import.meta.dirname, "index.html"),
            },
          },
        },
      },
)
