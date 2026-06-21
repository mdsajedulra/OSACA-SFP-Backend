import moment from "moment-timezone";
// import puppeteer from "puppeteer";
import { Types } from "mongoose";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  VerticalMergeType,
  WidthType,
} from "docx";

import { FoodDistribution } from "./distribution.model";
import schoolModel from "../school/school.model";

export type FoodColKey = "banruti" | "egg" | "banana" | "biscuit" | "milk";

export type OfficialReportTableRow = {
  serialBn: string;
  receiptDate: string;
  challanNo: string;
  challanDate: string;
  banruti: string;
  egg: string;
  banana: string;
  biscuit: string;
  milk: string;
  signature: string;
  remark: string;
};

export type OfficialMonthlyReportPayload = {
  schoolNameBn: string;
  emisCode: string;
  district: string;
  upazila: string;
  union: string;
  cluster: string;
  monthBn: string;
  yearBn: string;
  headTeacherPhoneNumber: string;
  tifinManagerNumber: string;
  table: OfficialReportTableRow[];
  totals: {
    banruti: string;
    egg: string;
    banana: string;
    biscuit: string;
    milk: string;
  };
};

export const FORM_COLORS = {
  headerLight: "#D0D0D0",
  headerChallan: "#D0D0D0",
  indexGreen: "#DDE9D4",
  totalRow: "#D0D0D0",
} as const;

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const MONTHS_BN = [
  "",
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export function toBengaliNumeralString(n: number | string): string {
  return String(n)
    .split("")
    .map((d) => BN_DIGITS[parseInt(d, 10)] ?? d)
    .join("");
}

export function monthNameBn(month1to12: number): string {
  return MONTHS_BN[month1to12] ?? "";
}

function toBanglaText(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return toBengaliNumeralString(String(value));
}

function toBanglaDate(date: Date | string): string {
  return toBengaliNumeralString(
    moment(date).tz("Asia/Dhaka").format("DD/MM/YYYY")
  );
}

function toBanglaMixedText(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

function resolveFoodColumn(food: string): FoodColKey | null {
  const f = String(food || "").toLowerCase().trim();

  if (
    f.includes("banruti") ||
    f.includes("bun") ||
    f.includes("bread") ||
    /বনরুটি|বানরুটি/.test(food)
  ) {
    return "banruti";
  }

  if (f.includes("egg") || f.includes("boiled") || /ডিম/.test(food)) {
    return "egg";
  }

  if (f.includes("banana") || /কলা/.test(food)) {
    return "banana";
  }

  if (
    f.includes("biscuit") ||
    f.includes("fortified") ||
    /বিস্কুট/.test(food)
  ) {
    return "biscuit";
  }

  if (f.includes("milk") || f.includes("uht") || /দুধ/.test(food)) {
    return "milk";
  }

  return null;
}

function emptyFoodCols(): Record<FoodColKey, number> {
  return { banruti: 0, egg: 0, banana: 0, biscuit: 0, milk: 0 };
}

function escapeHtml(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function banglaToEnglishDigits(value: string): string {
  const map: Record<string, string> = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };

  return String(value || "").replace(/[০-৯]/g, (d) => map[d] ?? d);
}

export const getSchoolDistributionMonthlyReport = async (
  schoolId: string,
  month: number,
  year: number
): Promise<OfficialMonthlyReportPayload> => {
  if (!Types.ObjectId.isValid(schoolId)) {
    throw new Error("Invalid school id");
  }

  const school = await schoolModel
    .findById(schoolId)
    .populate("address.upazilaId")
    .lean();

  if (!school) {
    throw new Error("School not found");
  }

  const upDoc = school.address?.upazilaId as
    | { upazilaName?: string }
    | null
    | undefined;

  const upazilaName =
    typeof upDoc === "object" && upDoc && "upazilaName" in upDoc
      ? String(upDoc.upazilaName ?? "")
      : "";

  const start = moment
    .tz({ year, month: month - 1, day: 1 }, "Asia/Dhaka")
    .startOf("month")
    .toDate();

  const end = moment
    .tz({ year, month: month - 1, day: 1 }, "Asia/Dhaka")
    .endOf("month")
    .toDate();

  const distributions = await FoodDistribution.find({
    schoolId: new Types.ObjectId(schoolId),
    date: { $gte: start, $lte: end },
    status: { $in: ["submitted", "confirmed"] },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();

  const table: OfficialReportTableRow[] = [];

  for (let index = 0; index < 31; index++) {
    const serialBn = toBengaliNumeralString(index + 1);
    const dist = distributions[index];

    if (!dist) {
      table.push({
        serialBn,
        receiptDate: "",
        challanNo: "",
        challanDate: "",
        banruti: "",
        egg: "",
        banana: "",
        biscuit: "",
        milk: "",
        signature: "",
        remark: "",
      });
      continue;
    }

    const receipt = toBanglaDate(dist.date);
    const cols = emptyFoodCols();

    for (const item of dist.items ?? []) {
      const k = resolveFoodColumn(item.food);
      if (k) {
        const received = Number(item.received) || 0;
        const sent = Number(item.sent) || 0;
        cols[k] += received > 0 ? received : sent;
      }
    }

    const challan = toBanglaMixedText(String((dist as any).challan ?? ""));

    table.push({
      serialBn,
      receiptDate: receipt,
      challanNo: challan,
      challanDate: receipt,
      banruti: cols.banruti ? toBanglaText(cols.banruti) : "",
      egg: cols.egg ? toBanglaText(cols.egg) : "",
      banana: cols.banana ? toBanglaText(cols.banana) : "",
      biscuit: cols.biscuit ? toBanglaText(cols.biscuit) : "",
      milk: cols.milk ? toBanglaText(cols.milk) : "",
      signature: "",
      remark: toBanglaMixedText(dist.remark?.trim() ?? ""),
    });
  }

  const sumCols = emptyFoodCols();
  for (const row of table) {
    (Object.keys(sumCols) as FoodColKey[]).forEach((k) => {
      const englishDigits = banglaToEnglishDigits(String(row[k] || ""));
      const n = parseInt(englishDigits, 10);
      if (!Number.isNaN(n)) sumCols[k] += n;
    });
  }

  return {
    schoolNameBn: school.schoolNameBangla || school.schoolName || "",
    emisCode: toBanglaText(school.schoolCode || ""),
    district: toBanglaMixedText(school.address?.district ?? ""),
    upazila: toBanglaMixedText(upazilaName),
    union: toBanglaMixedText(school.address?.union ?? ""),
    cluster: "",
    monthBn: monthNameBn(month),
    yearBn: toBanglaText(year),
    headTeacherPhoneNumber: toBanglaText(school.headTeacherPhoneNumber || ""),
    tifinManagerNumber: toBanglaText(
      (school as any).tifinManagerNumber ||
        (school as any).tifinManagerPNumber ||
        ""
    ),
    table,
    totals: {
      banruti: sumCols.banruti ? toBanglaText(sumCols.banruti) : "",
      egg: sumCols.egg ? toBanglaText(sumCols.egg) : "",
      banana: sumCols.banana ? toBanglaText(sumCols.banana) : "",
      biscuit: sumCols.biscuit ? toBanglaText(sumCols.biscuit) : "",
      milk: sumCols.milk ? toBanglaText(sumCols.milk) : "",
    },
  };
};

function buildPdfHtml(payload: OfficialMonthlyReportPayload): string {
  const rowsHtml = payload.table
    .map(
      (row) => `
      <tr>
        <td class="c">${escapeHtml(row.serialBn)}</td>
        <td class="l">${escapeHtml(row.receiptDate)}</td>
        <td class="c">${escapeHtml(row.challanNo)}</td>
        <td class="c">${escapeHtml(row.challanDate)}</td>
        <td class="c">${escapeHtml(row.banruti)}</td>
        <td class="c">${escapeHtml(row.egg)}</td>
        <td class="c">${escapeHtml(row.banana)}</td>
        <td class="c">${escapeHtml(row.biscuit)}</td>
        <td class="c">${escapeHtml(row.milk)}</td>
        <td class="c">${escapeHtml(row.signature)}</td>
        <td class="c">${escapeHtml(row.remark)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>Monthly Food Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&display=swap');

    * {
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 6mm;
    }

    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Noto Serif Bengali', serif;
      color: #000;
      font-size: 8.2px;
      line-height: 1.05;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 198mm;
      height: 285mm;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
    }

    .form-no {
      text-align: right;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 42px;
    }

    .title {
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .subtitle {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .period {
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .period-line {
      display: inline-block;
      min-width: 120px;
      border-bottom: 1px solid #000;
      text-align: center;
      line-height: 1;
      padding-bottom: 1px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .info-table {
      margin-bottom: 0;
    }

    .info-table td {
      border: 1px solid #000;
      padding: 2px 6px;
      vertical-align: middle;
      font-size: 8.4px;
      font-weight: 700;
      height: 22px;
    }

    .main-table {
      border: 1px solid #000;
      margin-top: 0;
    }

    .main-table th,
    .main-table td {
      border: 1px solid #000;
      padding: 1px 2px;
      text-align: center;
      vertical-align: middle;
      word-wrap: break-word;
      overflow-wrap: break-word;
      font-size: 7.1px;
      height: 16px;
    }

    .main-table thead th {
      font-weight: 700;
    }

    .main-table .hlight {
      background: ${FORM_COLORS.headerLight};
      font-weight: 700;
    }

    .main-table .hchallan {
      background: ${FORM_COLORS.headerChallan};
      font-weight: 700;
    }

    .main-table .hgreen {
      background: ${FORM_COLORS.indexGreen};
      font-weight: 700;
    }

    .main-table .htotal td {
      background: ${FORM_COLORS.totalRow};
      font-weight: 700;
      height: 18px;
    }

    .c { text-align: center; }
    .l { text-align: left; }

    .h1 th {
      height: 34px;
      font-size: 7.7px;
    }

    .h2 th {
      height: 24px;
      font-size: 7.2px;
    }

    .h3 th {
      height: 18px;
      font-size: 7px;
    }

    .sign-wrap {
      margin-top: 6px;
      width: 100%;
      border: 1px solid #000;
      border-bottom: none;
      border-right: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .sign-box {
      min-height: 66px;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 6px 7px 4px;
      font-size: 8px;
      line-height: 1.15;
    }

    .sign-title {
      font-weight: 700;
      margin-bottom: 8px;
    }

    .sign-line {
      margin-top: 4px;
    }

    .w1  { width: 6.5%; }
    .w2  { width: 10.5%; }
    .w3  { width: 10.5%; }
    .w4  { width: 10.5%; }
    .w5  { width: 7.8%; }
    .w6  { width: 7.8%; }
    .w7  { width: 7.8%; }
    .w8  { width: 9.2%; }
    .w9  { width: 7.8%; }
    .w10 { width: 11.5%; }
    .w11 { width: 15.1%; }
  </style>
</head>
<body>
  <div class="page">
    <div class="form-no">ফরম-০৪</div>

    <div class="title">সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি</div>
    <div class="subtitle">বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন</div>
    <div class="period">
      মাস:<span class="period-line">${escapeHtml(payload.monthBn)}</span>
      &nbsp;&nbsp;
      সাল:<span class="period-line">${escapeHtml(payload.yearBn)}</span>
    </div>

    <table class="info-table">
      <tr>
        <td>বিদ্যালয়ের নাম: ${escapeHtml(payload.schoolNameBn)}</td>
        <td>EMIS কোড: ${escapeHtml(payload.emisCode)}</td>
      </tr>
      <tr>
        <td>জেলা: ${escapeHtml(payload.district)}</td>
        <td>উপজেলা: ${escapeHtml(payload.upazila)}</td>
      </tr>
      <tr>
        <td>ইউনিয়ন: ${escapeHtml(payload.union)}</td>
        <td>ক্লাস্টার: ${escapeHtml(payload.cluster)}</td>
      </tr>
    </table>

    <table class="main-table">
      <colgroup>
        <col class="w1" />
        <col class="w2" />
        <col class="w3" />
        <col class="w4" />
        <col class="w5" />
        <col class="w6" />
        <col class="w7" />
        <col class="w8" />
        <col class="w9" />
        <col class="w10" />
        <col class="w11" />
      </colgroup>
      <thead>
        <tr class="h1">
          <th class="hlight" rowspan="2">ক্রমি<br/>ক<br/>নম্ব<br/>র</th>
          <th class="hlight" rowspan="2">খাদ্য<br/>গ্রহণের<br/>তারিখ</th>
          <th class="hchallan" rowspan="2">চালান<br/>নম্বর</th>
          <th class="hchallan" rowspan="2">চালানের<br/>তারিখ</th>
          <th class="hlight" colspan="5">গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)</th>
          <th class="hlight" rowspan="2">গ্রহণকারীর<br/>স্বাক্ষর</th>
          <th class="hlight" rowspan="2">মন্তব্য</th>
        </tr>
        <tr class="h2">
          <th class="hlight">বনরুটি</th>
          <th class="hlight">সিদ্ধ ডিম</th>
          <th class="hlight">কলা</th>
          <th class="hlight">ফর্টিফাইড<br/>বিস্কুট</th>
          <th class="hlight">ইউএইচটি<br/>দুধ</th>
        </tr>
        <tr class="h3 hgreen">
          <th>১</th>
          <th>২</th>
          <th>৩</th>
          <th>৪</th>
          <th>৫</th>
          <th>৬</th>
          <th>৭</th>
          <th>৮</th>
          <th>৯</th>
          <th>১০</th>
          <th>১১</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="htotal">
          <td colspan="4" class="l">মোট</td>
          <td>${escapeHtml(payload.totals.banruti)}</td>
          <td>${escapeHtml(payload.totals.egg)}</td>
          <td>${escapeHtml(payload.totals.banana)}</td>
          <td>${escapeHtml(payload.totals.biscuit)}</td>
          <td>${escapeHtml(payload.totals.milk)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="sign-wrap">
      <div class="sign-box">
        <div class="sign-title">টিফিন ম্যানেজারের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর: ${escapeHtml(payload.tifinManagerNumber)}</div>
      </div>

      <div class="sign-box">
        <div class="sign-title">প্রধান শিক্ষকের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর: ${escapeHtml(payload.headTeacherPhoneNumber)}</div>
      </div>

      <div class="sign-box">
        <div class="sign-title">সংশ্লিষ্ট ক্লাস্টারের উপজেলা সহকারী প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর:</div>
      </div>

      <div class="sign-box">
        <div class="sign-title">উপজেলা প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</div>
        <div class="sign-line">তারিখ:</div>
        <div class="sign-line">মোবাইল নম্বর:</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// export async function buildSchoolDistributionMonthPdf(
//   payload: OfficialMonthlyReportPayload
// ): Promise<Buffer> {
//   const browser = await puppeteer.launch({
//     headless: true,
//     executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   try {
//     const page = await browser.newPage();

//     await page.setViewport({
//       width: 1240,
//       height: 1754,
//       deviceScaleFactor: 1,
//     });

//     await page.setContent(buildPdfHtml(payload), {
//       waitUntil: "networkidle0",
//     });

//     await page.evaluateHandle("document.fonts.ready");

//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       preferCSSPageSize: true,
//       margin: {
//         top: "0mm",
//         right: "0mm",
//         bottom: "0mm",
//         left: "0mm",
//       },
//     });

//     return Buffer.from(pdf);
//   } finally {
//     await browser.close();
//   }
// }

const REPORT_FONT_FAMILY = "Nirmala UI";

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

function pCell(
  text: string,
  opts: {
    bold?: boolean;
    align?: typeof AlignmentType.CENTER | typeof AlignmentType.LEFT;
    size?: number;
  } = {}
): Paragraph {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.CENTER,
    spacing: { before: 20, after: 20 },
    children: [
      new TextRun({
        text: text || "",
        bold: opts.bold,
        size: opts.size ? opts.size * 2 : 18,
        font: REPORT_FONT_FAMILY,
      }),
    ],
  });
}

function docxCell(
  paragraphs: Paragraph[],
  options: {
    shading?: string;
    verticalMerge?: (typeof VerticalMergeType)[keyof typeof VerticalMergeType];
    columnSpan?: number;
  } = {}
): TableCell {
  return new TableCell({
    children: paragraphs,
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorder,
    shading: options.shading
      ? { fill: options.shading.replace("#", ""), type: ShadingType.CLEAR }
      : undefined,
    verticalMerge: options.verticalMerge,
    columnSpan: options.columnSpan,
  });
}

export async function buildSchoolDistributionMonthDocx(
  payload: OfficialMonthlyReportPayload
): Promise<Buffer> {
  const light = FORM_COLORS.headerLight.replace("#", "");
  const challan = FORM_COLORS.headerChallan.replace("#", "");
  const green = FORM_COLORS.indexGreen.replace("#", "");
  const totalFill = FORM_COLORS.totalRow.replace("#", "");

  const headerRow1 = new TableRow({
    children: [
      docxCell([pCell("ক্রমি\nক\nনম্ব\nর", { bold: true, size: 9 })], {
        shading: light,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("খাদ্য\nগ্রহণের\nতারিখ", { bold: true, size: 9 })], {
        shading: light,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("চালান\nনম্বর", { bold: true, size: 9 })], {
        shading: challan,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("চালানের\nতারিখ", { bold: true, size: 9 })], {
        shading: challan,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell(
        [pCell("গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)", { bold: true, size: 10 })],
        {
          shading: light,
          columnSpan: 5,
        }
      ),
      docxCell([pCell("গ্রহণকারীর\nস্বাক্ষর", { bold: true, size: 9 })], {
        shading: light,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("মন্তব্য", { bold: true, size: 9 })], {
        shading: light,
        verticalMerge: VerticalMergeType.RESTART,
      }),
    ],
  });

  const headerRow2 = new TableRow({
    children: [
      docxCell([new Paragraph("")], {
        shading: light,
        verticalMerge: VerticalMergeType.CONTINUE,
      }),
      docxCell([new Paragraph("")], {
        shading: light,
        verticalMerge: VerticalMergeType.CONTINUE,
      }),
      docxCell([new Paragraph("")], {
        shading: challan,
        verticalMerge: VerticalMergeType.CONTINUE,
      }),
      docxCell([new Paragraph("")], {
        shading: challan,
        verticalMerge: VerticalMergeType.CONTINUE,
      }),
      docxCell([pCell("বনরুটি", { bold: true, size: 8 })], { shading: light }),
      docxCell([pCell("সিদ্ধ ডিম", { bold: true, size: 8 })], { shading: light }),
      docxCell([pCell("কলা", { bold: true, size: 8 })], { shading: light }),
      docxCell([pCell("ফর্টিফাইড\nবিস্কুট", { bold: true, size: 7 })], { shading: light }),
      docxCell([pCell("ইউএইচটি\nদুধ", { bold: true, size: 8 })], { shading: light }),
      docxCell([new Paragraph("")], {
        shading: light,
        verticalMerge: VerticalMergeType.CONTINUE,
      }),
      docxCell([new Paragraph("")], {
        shading: light,
        verticalMerge: VerticalMergeType.CONTINUE,
      }),
    ],
  });

  const indexRow = new TableRow({
    children: ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১"].map(
      (n) => docxCell([pCell(n, { bold: true, size: 11 })], { shading: green })
    ),
  });

  const dataRows = payload.table.map((row) => {
    const vals = [
      row.serialBn,
      row.receiptDate,
      row.challanNo,
      row.challanDate,
      row.banruti,
      row.egg,
      row.banana,
      row.biscuit,
      row.milk,
      row.signature,
      row.remark,
    ];

    return new TableRow({
      children: vals.map((v, i) =>
        docxCell(
          [
            pCell(v, {
              size: 8,
              align: i <= 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
            }),
          ],
          {}
        )
      ),
    });
  });

  const totalRow = new TableRow({
    children: [
      docxCell([pCell("মোট", { bold: true, align: AlignmentType.LEFT, size: 9 })], {
        shading: totalFill,
        columnSpan: 4,
      }),
      docxCell([pCell(payload.totals.banruti, { bold: true, size: 9 })], {
        shading: totalFill,
      }),
      docxCell([pCell(payload.totals.egg, { bold: true, size: 9 })], {
        shading: totalFill,
      }),
      docxCell([pCell(payload.totals.banana, { bold: true, size: 9 })], {
        shading: totalFill,
      }),
      docxCell([pCell(payload.totals.biscuit, { bold: true, size: 9 })], {
        shading: totalFill,
      }),
      docxCell([pCell(payload.totals.milk, { bold: true, size: 9 })], {
        shading: totalFill,
      }),
      docxCell([pCell("", {})], { shading: totalFill }),
      docxCell([pCell("", {})], { shading: totalFill }),
    ],
  });

  const colTwip = [520, 850, 680, 680, 600, 600, 560, 660, 600, 720, 820];

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: colTwip,
    rows: [headerRow1, headerRow2, indexRow, ...dataRows, totalRow],
  });

  const sigLines = (lines: string[]) =>
    lines.map(
      (ln) =>
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: ln,
              bold: true,
              font: REPORT_FONT_FAMILY,
              size: 20,
            }),
          ],
        })
    );

  const sigTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          docxCell(
            sigLines([
              "টিফিন ম্যানেজারের স্বাক্ষর ও সিল:",
              "তারিখ:",
              `মোবাইল নম্বর: ${payload.tifinManagerNumber}`,
            ])
          ),
          docxCell(
            sigLines([
              "প্রধান শিক্ষকের স্বাক্ষর ও সিল:",
              "তারিখ:",
              `মোবাইল নম্বর: ${payload.headTeacherPhoneNumber}`,
            ])
          ),
        ],
      }),
      new TableRow({
        children: [
          docxCell(
            sigLines([
              "সংশ্লিষ্ট ক্লাস্টারের উপজেলা সহকারী প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:",
              "তারিখ:",
              "মোবাইল নম্বর:",
            ])
          ),
          docxCell(
            sigLines([
              "উপজেলা প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:",
              "তারিখ:",
              "মোবাইল নম্বর:",
            ])
          ),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 260 },
            children: [
              new TextRun({
                text: "ফরম-০৪",
                bold: true,
                size: 24,
                font: REPORT_FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি",
                bold: true,
                size: 28,
                font: REPORT_FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: "বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন",
                bold: true,
                size: 24,
                font: REPORT_FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: `মাস: ${payload.monthBn}     সাল: ${payload.yearBn}`,
                bold: true,
                size: 22,
                font: REPORT_FONT_FAMILY,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [5040, 4320],
            rows: [
              new TableRow({
                children: [
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "বিদ্যালয়ের নাম: ",
                          bold: true,
                          font: REPORT_FONT_FAMILY,
                        }),
                        new TextRun({
                          text: payload.schoolNameBn,
                          font: REPORT_FONT_FAMILY,
                        }),
                      ],
                    }),
                  ]),
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "EMIS কোড: ",
                          bold: true,
                          font: REPORT_FONT_FAMILY,
                        }),
                        new TextRun({
                          text: payload.emisCode,
                          font: REPORT_FONT_FAMILY,
                        }),
                      ],
                    }),
                  ]),
                ],
              }),
              new TableRow({
                children: [
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "জেলা: ",
                          bold: true,
                          font: REPORT_FONT_FAMILY,
                        }),
                        new TextRun({
                          text: payload.district,
                          font: REPORT_FONT_FAMILY,
                        }),
                      ],
                    }),
                  ]),
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "উপজেলা: ",
                          bold: true,
                          font: REPORT_FONT_FAMILY,
                        }),
                        new TextRun({
                          text: payload.upazila,
                          font: REPORT_FONT_FAMILY,
                        }),
                      ],
                    }),
                  ]),
                ],
              }),
              new TableRow({
                children: [
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "ইউনিয়ন: ",
                          bold: true,
                          font: REPORT_FONT_FAMILY,
                        }),
                        new TextRun({
                          text: payload.union,
                          font: REPORT_FONT_FAMILY,
                        }),
                      ],
                    }),
                  ]),
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "ক্লাস্টার: ",
                          bold: true,
                          font: REPORT_FONT_FAMILY,
                        }),
                        new TextRun({
                          text: payload.cluster,
                          font: REPORT_FONT_FAMILY,
                        }),
                      ],
                    }),
                  ]),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 } }),
          mainTable,
          new Paragraph({ spacing: { after: 240 } }),
          sigTable,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export const exportSchoolDistributionMonthlyReport = async (
  payload: OfficialMonthlyReportPayload,
  format: "pdf" | "docx",
  period: { year: number; month: number }
) => {
  const safeCode = banglaToEnglishDigits(payload.emisCode).replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
  );
  const ym = `${period.year}-${String(period.month).padStart(2, "0")}`;
  const base = `monthly-food-report-${safeCode}-${ym}`;

  // if (format === "pdf") {
  //   const buffer = await buildSchoolDistributionMonthPdf(payload);
  //   return {
  //     buffer,
  //     contentType: "application/pdf",
  //     filename: `${base}.pdf`,
  //   };
  // }

  const buffer = await buildSchoolDistributionMonthDocx(payload);
  return {
    buffer,
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: `${base}.docx`,
  };
};