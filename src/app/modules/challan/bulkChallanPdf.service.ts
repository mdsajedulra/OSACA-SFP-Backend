import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { FoodDistribution } from "../foodDistributions/distribution.model";

import { formatDate } from "../../utils/formatDate";
import { challanHTML } from "../../utils/challanHTML";
import { ZipArchive } from "archiver";

const CHROME_PATH =
  "C:/Users/mdsaj/.cache/puppeteer/chrome-headless-shell/win64-149.0.7827.22/chrome-headless-shell-win64/chrome-headless-shell.exe";

function getLogoBase64(): string {
  const logoPath = path.join(process.cwd(), "src/assets/osaca-logo.webp");
  if (fs.existsSync(logoPath)) {
    const logo = fs.readFileSync(logoPath);
    return `data:image/webp;base64,${logo.toString("base64")}`;
  }
  return "";
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildFullHTML(challans: any[], logoBase64: string): string {
  const pages = challans
    .map(
      (c) => `
  <div class="page">
    <div class="guide-x"></div>
    <div class="guide-y"></div>
    ${challanHTML(c, logoBase64)}
    ${challanHTML(c, logoBase64)}
    ${challanHTML(c, logoBase64)}
    ${challanHTML(c, logoBase64)}
  </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Serif Bengali',serif; background:#fff; }

  .page {
    width: 10in;
    height: 15in;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 4px;
    padding: 6px;
    position: relative;
   
    page-break-after: always;
    overflow: hidden;
  }

  .guide-x {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    border-top: 1px dashed red;
    pointer-events: none;
    z-index: 10;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  .guide-y {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    border-left: 1px dashed blue;
    pointer-events: none;
    z-index: 10;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  .challan{ width:90%; height:100%; margin-left:0.3in; background:#fff; font-size:12px; overflow:hidden;  border: 0.5px }
  table{ width:100%; border-collapse:collapse; }
  td,th{ border:0.5px solid #000; padding:2px 3px; vertical-align:top; font-size:12px; }
  th{ color:#000; text-align:center; font-weight:700; font-size:12px; }
  .top-td{ border:none; padding:3px 4px; vertical-align:bottom; }
  .serial{ font-size:12px; font-weight:700; }
  .challan-no{ font-size:12px; font-weight:700; margin-top:1px; }
  .logo-name{ font-size:12px; font-weight:900; color:#c00; letter-spacing:1px; line-height:1; }
  .logo-sub{ font-size:12px; color:#333; line-height:1; }
  .form-badge{ font-size:12px; border:0.5px solid #000; padding:1px 5px; display:inline-block; margin-bottom:2px; }
  .title-bar{ background:#BFBFBF; border-left:0.5px solid #000; border-right:0.5px solid #000; border-top:0.5px solid #000; color:#000; text-align:center; font-size:12px; font-weight:700; padding:3px 0; }
  .bg-gray{ background:#BFBFBF; }
  .sec-head{ font-weight:700; font-size:12px; display:block; }
  .fl{ display:inline-block; min-width:65px; font-size:12px;  }
  .f2{ display:inline-block; min-width:60px; font-size:12px; }
  .fv{ font-size:12px; }
  .frow{ display:flex; line-height:1.2; margin-bottom:1px; }
  .bank-label{ font-size:12px; font-weight:600; }
  .bank-no{ font-size:12px; font-weight:700; margin-top:2px; }
  .sign-title{ font-weight:700; font-size:12px; #000; padding-bottom:2px; margin-bottom:36px; margin-top:5px; }
  .sign-line{ font-size:12px; line-height:1; }
  .note-td{ font-size:12px; line-height:1; width:50%; }
</style>
</head>
<body>
  ${pages}
</body>
</html>`;
}

async function generatePdfBuffer(
  challans: any[],
  browser: any,
  logoBase64: string,
): Promise<Buffer> {
  const CHUNK_SIZE = 50;
  const chunks: any[][] = [];
  for (let i = 0; i < challans.length; i += CHUNK_SIZE) {
    chunks.push(challans.slice(i, i + CHUNK_SIZE));
  }

  const chunkPdfs: Buffer[] = [];

  for (const chunk of chunks) {
    const page = await browser.newPage();
    await page.setContent(buildFullHTML(chunk, logoBase64), {
      waitUntil: "domcontentloaded",
    });
    await new Promise((r) => setTimeout(r, 1500));

    const pdfBuffer = await page.pdf({
      width: "10in",
      height: "15in",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    chunkPdfs.push(Buffer.from(pdfBuffer));
    await page.close();
  }

  const mergedPdf = await PDFDocument.create();
  for (const buf of chunkPdfs) {
    const pdf = await PDFDocument.load(buf);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => mergedPdf.addPage(p));
  }

  const bytes = await mergedPdf.save();
  return Buffer.from(bytes);
}

export async function generateAllChallansPdf(batchId: string): Promise<string> {
  const logoBase64 = getLogoBase64();

  const distributions = await FoodDistribution.find({ batchId })
    .populate({
      path: "schoolId",
      populate: {
        path: "address.upazilaId",
        model: "Upazila",
      },
    })
    .sort({ date: 1 })
    .lean();

  const upazilaMap = new Map<string, Map<string, any[]>>();

  for (const dist of distributions) {
    const school = dist.schoolId as any;
    const upazila = school?.address?.upazilaId as any;
    const upazilaName = upazila?.upazilaName ?? "অজানা-উপজেলা";
    const dateStr = toLocalDateStr(new Date(dist.date));

    if (!upazilaMap.has(upazilaName)) {
      upazilaMap.set(upazilaName, new Map());
    }

    const dateMap = upazilaMap.get(upazilaName)!;

    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, []);
    }

    for (const item of dist.items) {
      dateMap.get(dateStr)!.push({
        challanNo: String(item.challanNo),
        date: formatDate(new Date(dist.date)),
        schoolName: school?.schoolNameBangla ?? "",
        schoolCode: school?.schoolCode ?? "",
        union: school?.address?.union ?? "",
        upazila: upazilaName,
        district: school?.address?.district ?? "",
        foodName: item.food,
        quantity: item.sent,
        pdOfficeSerial: school?.pdOfficeSerial ?? 0,
        concernedOfficerName: upazila?.concernedOfficerName ?? "",
        concernedOfficerNumber: upazila?.concernedOfficerNumber ?? "",
        concernedOfficerDesignation: upazila?.concernedOfficerDesignation ?? "",
      });
    }
  }

  const outputDir = path.join(process.cwd(), "exports", batchId);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const tmpDir = path.join(process.cwd(), `chrome-tmp-${Date.now()}`);
  const browser = await puppeteer.launch({
    headless: true,
    // executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      // "--disable-setuid-sandbox",
      // "--disable-dev-shm-usage",
      // "--disable-extensions",
      // "--no-first-run",
    ],
    // userDataDir: tmpDir,
  });

  try {
    for (const [upazilaName, dateMap] of upazilaMap) {
      console.log(`📁 উপজেলা: ${upazilaName}`);

      const upazilaDir = path.join(outputDir, upazilaName);
      if (!fs.existsSync(upazilaDir)) {
        fs.mkdirSync(upazilaDir, { recursive: true });
      }

      for (const [dateStr, challans] of dateMap) {
        console.log(`  📅 ${dateStr} — ${challans.length} চালান`);

        challans.sort(
          (a, b) =>
            Number(a.pdOfficeSerial ?? 0) - Number(b.pdOfficeSerial ?? 0),
        );

        const pdfBuffer = await generatePdfBuffer(
          challans,
          browser,
          logoBase64,
        );

        const pdfPath = path.join(
          upazilaDir,
          `${upazilaName + " " + dateStr}.pdf`,
        );
        fs.writeFileSync(pdfPath, pdfBuffer);
      }
    }
  } finally {
    await browser.close();
    setTimeout(() => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (e) {}
    }, 3000);
  }

  console.log("🗜️ ZIP বানানো হচ্ছে...");
  const zipPath = path.join(
    process.cwd(),
    "exports",
    `challans-${batchId}.zip`,
  );

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(outputDir, false);
    archive.finalize();
  });

  fs.rmSync(outputDir, { recursive: true, force: true });

  console.log(`✅ ZIP ready: ${zipPath}`);
  return zipPath;
}
