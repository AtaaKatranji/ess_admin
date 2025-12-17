/* scripts/build-pdfmake-vfs.js */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString("base64");
}

const fontsDir = path.join(__dirname, "..", "public", "pdf-fonts");
const outFile = path.join(__dirname, "..", "src", "pdfmake", "vfs_cairo.js");

const vfs = {
  "Cairo-Regular.ttf": toBase64(path.join(fontsDir, "Cairo-Regular.ttf")),
  "Cairo-Bold.ttf": toBase64(path.join(fontsDir, "Cairo-Bold.ttf")),
};

const content = `// auto-generated\nexport const vfsCairo = ${JSON.stringify(vfs, null, 2)};\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, content, "utf8");

console.log("Generated:", outFile);
