import puppeteer, { Browser } from "puppeteer-core";
import { existsSync } from "fs";
import { execSync } from "child_process";

const resolveChromePath = (): string | null => {
  // 1. Environment variable
  if (
    process.env.PUPPETEER_EXECUTABLE_PATH &&
    existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)
  ) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // 2. Puppeteer browser
  try {
    const path = execSync(
      "npx puppeteer browsers list chrome-headless-shell",
      { encoding: "utf-8" }
    )
      .split("\n")
      .find((line) => line.includes("chrome-headless-shell"))
      ?.split(" ")
      .pop();

    if (path && existsSync(path)) {
      return path;
    }
  } catch {
    // Puppeteer/Chrome not available
  }

  // 3. System Chrome
  const candidates =
    process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : process.platform === "linux"
        ? [
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
          ]
        : ["C:/Program Files/Google/Chrome/Application/chrome.exe"];

  const found = candidates.find((p) => existsSync(p));

  if (found) {
    return found;
  }

  // Chrome না থাকলেও server crash করবে না
  console.warn(
    "⚠️ Chrome not found. Puppeteer features are disabled."
  );

  return null;
};

const CHROME_PATH = resolveChromePath();

export const launchBrowser = async (): Promise<Browser> => {
  if (!CHROME_PATH) {
    throw new Error(
      "PDF/browser feature is not available on this server because Chrome is not installed."
    );
  }

  return puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
};