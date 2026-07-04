import puppeteer, { Browser } from "puppeteer-core";
import { existsSync } from "fs";
import { execSync } from "child_process";

const resolveChromePath = (): string => {
  // ১. Env variable সবচেয়ে priority পাবে (VPS-এ এটা set করবে)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // ২. Puppeteer-এর নিজের install করা browser খোঁজো (Mac/Windows/Linux সব জায়গায় কাজ করে)
  try {
    const path = execSync(
      "npx puppeteer browsers list chrome-headless-shell",
      { encoding: "utf-8" }
    )
      .split("\n")
      .find((line) => line.includes("chrome-headless-shell"))
      ?.split(" ")
      .pop();
    if (path && existsSync(path)) return path;
  } catch {
    // ignore, fallback-এ যাও
  }

  // ৩. System Chrome fallback (platform অনুযায়ী)
  const candidates =
    process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : process.platform === "linux"
        ? ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"]
        : ["C:/Program Files/Google/Chrome/Application/chrome.exe"];

  const found = candidates.find((p) => existsSync(p));
  if (found) return found;

  throw new Error(
    "Chrome not found. Run: npx puppeteer browsers install chrome-headless-shell"
  );
};

// Path একবারই resolve হবে, প্রতি request-এ না
const CHROME_PATH = resolveChromePath();

export const launchBrowser = (): Promise<Browser> =>
  puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });