import path from "path";
import fs from "fs";

export function getLogoBase64(): string {
  const logoPath = path.join(process.cwd(), "src/assets/osaca-logo.webp");
  if (fs.existsSync(logoPath)) {
    const logo = fs.readFileSync(logoPath);
    return `data:image/webp;base64,${logo.toString("base64")}`;
  }
  return "";
}