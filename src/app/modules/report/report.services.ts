import { buildFullHTML } from "../../template/form4";
import { getBdMonthRange } from "../../utils/getBDMonthRange";
import { FoodDistribution } from "../foodDistributions/distribution.model";
import { BN_MONTHS } from "../../constant/BN_MONTH";
import { launchBrowser } from "../../utils/puppeteer.browser";
import fs from "fs";
import path from "path";


const form4Report = async (year: number, month: number) => {
  const { start, end } = getBdMonthRange(year, month);

  const distributions = await FoodDistribution.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    { $sort: { date: 1 } },
    {
      $group: {
        _id: "$schoolId",
        distributions: { $push: "$$ROOT" },
        totalCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "schools",
        localField: "_id",
        foreignField: "_id",
        as: "school",
      },
    },
    {
      $unwind: "$school",
    },
    { $sort: { "school.pdOfficeSerial": 1 } },
  ]);

  if (!distributions || distributions.length === 0) {
    throw new Error("No distributions found for the specified month and year.");
  }

  const html = buildFullHTML(distributions, BN_MONTHS[month - 1], year);
  const browser = await launchBrowser();
    try {
    const page = await browser.newPage();
    await page.setContent(html, {
      // use a waitUntil value compatible with the Puppeteer types
      waitUntil: "load",
      timeout: 300000, // 5 min
    });

    // Response এ না পাঠিয়ে file এ save করো
    const fileName = `form4-${year}-${month}-${Date.now()}.pdf`;
    const outputDir = path.join(process.cwd(), "public", "reports");

    // folder না থাকলে বানাও
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, fileName);

    await page.pdf({
      path: filePath, // ← সরাসরি disk এ লেখে, memory তে রাখে না
      format: "A4",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    return { fileName, url: `/reports/${fileName}` };
  } finally {
    await browser.close();
  }

};

export const reportServices = {
  form4Report,
};
