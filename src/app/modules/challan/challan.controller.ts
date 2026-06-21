import catchAsync from "../../utils/catchAsync";
import { formatDate } from "../../utils/formatDate";
import { getLogoBase64 } from "../../utils/logo";
import { FoodDistribution } from "../foodDistributions/distribution.model";

import puppeteer from "puppeteer-core";
import { buildSingleHTML } from "./challan.service";

const CHROME_PATH =
  "C:/Users/mdsaj/.cache/puppeteer/chrome-headless-shell/win64-149.0.7827.22/chrome-headless-shell-win64/chrome-headless-shell.exe";

const getSingleChallan = catchAsync(async (req, res) => {
  const { challanNo } = req.params;

  // ১. DB থেকে আনো
  const challan = await FoodDistribution.findOne({
    "items.challanNo": challanNo,
  })
    .populate({
      path: "schoolId",
      populate: { path: "address.upazilaId", model: "Upazila" },
    })
    .lean();

  if (!challan) {
    return res.status(404).json({ message: "Challan not found" });
  }

  const school = challan?.schoolId as any;
  const upazila = school?.address?.upazilaId as any;
  const item = challan?.items.find((i: any) => i.challanNo == challanNo);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // ২. Data বানাও
  const challanData = {
    challanNo: String(item?.challanNo ?? ""),
    date: formatDate(new Date(challan?.date ?? new Date())),
    schoolName: school?.schoolNameBangla ?? "",
    schoolCode: school?.schoolCode ?? "",
    union: school?.address?.union ?? "",
    upazila: upazila?.upazilaName ?? "",
    district: school?.address?.district ?? "",
    foodName: item?.food,
    quantity: item?.sent,
    pdOfficeSerial: school?.pdOfficeSerial ?? "",
    concernedOfficerName: upazila?.concernedOfficerName ?? "",
    concernedOfficerNumber: upazila?.concernedOfficerNumber ?? "",
    concernedOfficerDesignation: upazila?.concernedOfficerDesignation ?? "",
  };

  // ৩. HTML বানাও
  const logoBase64 = getLogoBase64();
  const html = buildSingleHTML(challanData, logoBase64);

  // ৪. Puppeteer দিয়ে PDF বানাও
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 300));

    const pdfBuffer = await page.pdf({
      width: "10in",
      height: "15in",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    // ৫. PDF response পাঠাও
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=challan-${challanNo}.pdf`,
    );
    res.send(Buffer.from(pdfBuffer));
  } finally {
    await browser.close();
  }
});

export const challanController = { getSingleChallan };
