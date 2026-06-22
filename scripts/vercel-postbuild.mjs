#!/usr/bin/env node
// Ensures Vercel Build Output API v3 exists after `vite build`.
// Nitro's Vercel preset writes `.vercel/output/` directly; Lovable's sandbox
// build writes `dist/`, so this script only converts `dist/` as a fallback.
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const dist = join(root, "dist");
const out = join(root, ".vercel", "output");
const outConfig = join(out, "config.json");

function readNitroPreset() {
  try {
    const nitroJson = JSON.parse(readFileSync(join(dist, "nitro.json"), "utf8"));
    return typeof nitroJson.preset === "string" ? nitroJson.preset : "";
  } catch {
    return "";
  }
}

if (!existsSync(dist)) {
  if (existsSync(outConfig)) {
    console.log("[vercel-postbuild] Nitro already emitted .vercel/output/; nothing to convert.");
    process.exit(0);
  }
  console.error("[vercel-postbuild] neither dist/ nor .vercel/output/ found — did `vite build` run?");
  process.exit(1);
}

if (existsSync(outConfig) && readNitroPreset().startsWith("vercel")) {
  console.log("[vercel-postbuild] Using Nitro's native Vercel output.");
  process.exit(0);
}

// Clean previous output
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1) Copy client assets → static/
const clientSrc = join(dist, "client");
const clientDst = join(out, "static");
if (existsSync(clientSrc)) {
  cpSync(clientSrc, clientDst, { recursive: true });
} else {
  // Some Nitro presets emit `public/` instead of `client/`
  const publicSrc = join(dist, "public");
  if (existsSync(publicSrc)) cpSync(publicSrc, clientDst, { recursive: true });
  else mkdirSync(clientDst, { recursive: true });
}

// 2) Copy server output → functions/__server.func/
const serverSrc = existsSync(join(dist, "server")) ? join(dist, "server") : dist;
const fnDir = join(out, "functions", "__server.func");
mkdirSync(fnDir, { recursive: true });
cpSync(serverSrc, fnDir, { recursive: true });

// .vc-config.json for the function
writeFileSync(
  join(fnDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

// 3) Top-level config.json — route everything to the server function,
//    Vercel serves `static/` first.
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/__server" },
      ],
    },
    null,
    2,
  ),
);

console.log("[vercel-postbuild] Wrote .vercel/output/ (config.json, static/, functions/__server.func/)");