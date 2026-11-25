// Packages the project source (without node_modules or build output) into a ZIP
// next to the project folder: ../client-service-coordinator-portfolio.zip
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = path.basename(root);
const outFile = path.resolve(root, "..", `${name}.zip`);

const output = fs.createWriteStream(outFile);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`Created ${outFile} (${(archive.pointer() / 1024 / 1024).toFixed(1)} MB)`);
});
archive.on("warning", (err) => console.warn(err));
archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.glob("**/*", {
  cwd: root,
  dot: true,
  ignore: ["node_modules/**", ".next/**", "out/**", "*.tsbuildinfo", ".claude/**", ".DS_Store", ".vercel/**", ".env*"],
}, { prefix: name });
await archive.finalize();
