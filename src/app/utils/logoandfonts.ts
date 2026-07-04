import path from "path";
import fs, { readFileSync } from "fs";

export function getLogoBase64(): string {
  const logoPath = path.join(process.cwd(), "src/assets/osaca-logo.webp");
  if (fs.existsSync(logoPath)) {
    const logo = fs.readFileSync(logoPath);
    return `data:image/webp;base64,${logo.toString("base64")}`;
  }
  return "";
}


let cachedFont: string | null = null;

export function getBengaliFontBase64(): string {
  if (cachedFont) return cachedFont; // প্রতিবার disk read না করে cache
  const fontPath = path.join(process.cwd(), "src/assets/NotoSerifBengali.ttf");
  cachedFont = readFileSync(fontPath).toString("base64");
  return cachedFont;
}