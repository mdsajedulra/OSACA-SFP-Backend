import moment from "moment-timezone";
import puppeteer from "puppeteer";
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
  headerLight: "#D9D9D9",
  headerChallan: "#BFBFBF",
  indexGreen: "#D9EAD3",
  totalRow: "#D9D9D9",
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

  if (
    f.includes("egg") ||
    f.includes("boiled") ||
    /ডিম/.test(food)
  ) {
    return "egg";
  }

  if (
    f.includes("banana") ||
    /কলা/.test(food)
  ) {
    return "banana";
  }

  if (
    f.includes("biscuit") ||
    f.includes("fortified") ||
    /বিস্কুট/.test(food)
  ) {
    return "biscuit";
  }

  if (
    f.includes("milk") ||
    f.includes("uht") ||
    /দুধ/.test(food)
  ) {
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
    .sort({ date: 1 })
    .lean();

  const byDate = new Map<string, (typeof distributions)[0]>();
  for (const d of distributions) {
    const key = moment(d.date).tz("Asia/Dhaka").format("YYYY-MM-DD");
    byDate.set(key, d);
  }

  const daysInMonth = moment
    .tz({ year, month: month - 1, day: 1 }, "Asia/Dhaka")
    .daysInMonth();

  const table: OfficialReportTableRow[] = [];

  for (let day = 1; day <= 30; day++) {
    const serialBn = toBengaliNumeralString(day);

    if (day > daysInMonth) {
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

    const key = moment
      .tz({ year, month: month - 1, day }, "Asia/Dhaka")
      .format("YYYY-MM-DD");

    const dist = byDate.get(key);

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

    const receipt = moment(dist.date).tz("Asia/Dhaka").format("DD/MM/YYYY");
    const cols = emptyFoodCols();

    for (const item of dist.items ?? []) {
      const k = resolveFoodColumn(item.food);
      if (k) {
        const received = Number(item.received) || 0;
        const sent = Number(item.sent) || 0;
        cols[k] += received > 0 ? received : sent;
      }
    }

    const challanSource = String((dist as any).challan ?? (dist as any).uuid ?? "");
    const challan = challanSource.replace(/-/g, "").slice(0, 14);

    table.push({
      serialBn,
      receiptDate: receipt,
      challanNo: challan,
      challanDate: receipt,
      banruti: cols.banruti ? String(cols.banruti) : "",
      egg: cols.egg ? String(cols.egg) : "",
      banana: cols.banana ? String(cols.banana) : "",
      biscuit: cols.biscuit ? String(cols.biscuit) : "",
      milk: cols.milk ? String(cols.milk) : "",
      signature: "",
      remark: dist.remark?.trim() ?? "",
    });
  }

  const sumCols = emptyFoodCols();
  for (const row of table) {
    (Object.keys(sumCols) as FoodColKey[]).forEach((k) => {
      const n = parseInt(row[k], 10);
      if (!Number.isNaN(n)) sumCols[k] += n;
    });
  }

  return {
    schoolNameBn: school.schoolNameBangla || school.schoolName || "",
    emisCode: school.schoolCode || "",
    district: school.address?.district ?? "",
    upazila: upazilaName,
    union: school.address?.union ?? "",
    cluster: "",
    monthBn: monthNameBn(month),
    yearBn: toBengaliNumeralString(year),
    headTeacherPhoneNumber: school.headTeacherPhoneNumber || "",
    tifinManagerNumber: school.tifinManagerPNumber || "",
    table,
    totals: {
      banruti: sumCols.banruti ? String(sumCols.banruti) : "",
      egg: sumCols.egg ? String(sumCols.egg) : "",
      banana: sumCols.banana ? String(sumCols.banana) : "",
      biscuit: sumCols.biscuit ? String(sumCols.biscuit) : "",
      milk: sumCols.milk ? String(sumCols.milk) : "",
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
    }

    .title {
      text-align: center;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 1px;
    }

    .subtitle {
      text-align: center;
      font-size: 10.5px;
      margin-bottom: 2px;
    }

    .period {
      text-align: center;
      font-size: 10px;
      margin-bottom: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .info-table {
      margin-bottom: 5px;
    }

    .info-table td {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: middle;
      font-size: 8.6px;
      height: 22px;
    }

    .label {
      font-weight: 700;
    }

    .main-table {
      border: 1px solid #000;
    }

    .main-table th,
    .main-table td {
      border: 1px solid #000;
      padding: 1px 2px;
      text-align: center;
      vertical-align: middle;
      word-wrap: break-word;
      overflow-wrap: break-word;
      font-size: 7.3px;
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
      height: 28px;
      font-size: 7.5px;
    }

    .h2 th {
      height: 22px;
      font-size: 7.1px;
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
    .w10 { width: 9%; }
    .w11 { width: 12.6%; }
  </style>
</head>
<body>
  <div class="page">
    <div class="title">সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি</div>
    <div class="subtitle">বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন</div>
    <div class="period">মাস: ${escapeHtml(payload.monthBn)} &nbsp;&nbsp;&nbsp; সাল: ${escapeHtml(payload.yearBn)}</div>

    <table class="info-table">
      <tr>
        <td><span class="label">বিদ্যালয়ের নাম:</span> ${escapeHtml(payload.schoolNameBn)}</td>
        <td><span class="label">EMIS কোড:</span> ${escapeHtml(payload.emisCode)}</td>
      </tr>
      <tr>
        <td><span class="label">জেলা:</span> ${escapeHtml(payload.district)}</td>
        <td><span class="label">উপজেলা:</span> ${escapeHtml(payload.upazila)}</td>
      </tr>
      <tr>
        <td><span class="label">ইউনিয়ন:</span> ${escapeHtml(payload.union)}</td>
        <td><span class="label">ক্লাস্টার:</span> ${escapeHtml(payload.cluster)}</td>
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
          <th class="hlight" rowspan="2">ক্রমিক<br/>নম্বর</th>
          <th class="hlight" rowspan="2">খাদ্য গ্রহণের তারিখ</th>
          <th class="hchallan" rowspan="2">চালান নম্বর</th>
          <th class="hchallan" rowspan="2">চালানের তারিখ</th>
          <th class="hlight" colspan="5">গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)</th>
          <th class="hlight" rowspan="2">গ্রহণকারীর<br/>স্বাক্ষর</th>
          <th class="hlight" rowspan="2">মন্তব্য</th>
        </tr>
        <tr class="h2">
          <th class="hlight">বনরুটি</th>
          <th class="hlight">সিদ্ধ ডিম</th>
          <th class="hlight">কলা</th>
          <th class="hlight">ফর্টিফাইড বিস্কুট</th>
          <th class="hlight">ইউএইচটি দুধ</th>
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

export async function buildSchoolDistributionMonthPdf(
  payload: OfficialMonthlyReportPayload
): Promise<Buffer> {
  const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    await page.setContent(buildPdfHtml(payload), {
      waitUntil: "networkidle0",
    });

    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

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
      docxCell([pCell("ক্রমিক\nনম্বর", { bold: true, size: 9 })], {
        shading: light,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("খাদ্য গ্রহণের তারিখ", { bold: true, size: 9 })], {
        shading: light,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("চালান নম্বর", { bold: true, size: 9 })], {
        shading: challan,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("চালানের তারিখ", { bold: true, size: 9 })], {
        shading: challan,
        verticalMerge: VerticalMergeType.RESTART,
      }),
      docxCell([pCell("গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)", { bold: true, size: 10 })], {
        shading: light,
        columnSpan: 5,
      }),
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
      docxCell([new Paragraph("")], { shading: light, verticalMerge: VerticalMergeType.CONTINUE }),
      docxCell([new Paragraph("")], { shading: light, verticalMerge: VerticalMergeType.CONTINUE }),
      docxCell([new Paragraph("")], { shading: challan, verticalMerge: VerticalMergeType.CONTINUE }),
      docxCell([new Paragraph("")], { shading: challan, verticalMerge: VerticalMergeType.CONTINUE }),
      docxCell([pCell("বনরুটি", { bold: true, size: 8 })], { shading: light }),
      docxCell([pCell("সিদ্ধ ডিম", { bold: true, size: 8 })], { shading: light }),
      docxCell([pCell("কলা", { bold: true, size: 8 })], { shading: light }),
      docxCell([pCell("ফর্টিফাইড বিস্কুট", { bold: true, size: 7 })], { shading: light }),
      docxCell([pCell("ইউএইচটি দুধ", { bold: true, size: 8 })], { shading: light }),
      docxCell([new Paragraph("")], { shading: light, verticalMerge: VerticalMergeType.CONTINUE }),
      docxCell([new Paragraph("")], { shading: light, verticalMerge: VerticalMergeType.CONTINUE }),
    ],
  });

  const indexRow = new TableRow({
    children: ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১"].map((n) =>
      docxCell([pCell(n, { bold: true, size: 11 })], { shading: green })
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
      docxCell([pCell(payload.totals.banruti, { bold: true, size: 9 })], { shading: totalFill }),
      docxCell([pCell(payload.totals.egg, { bold: true, size: 9 })], { shading: totalFill }),
      docxCell([pCell(payload.totals.banana, { bold: true, size: 9 })], { shading: totalFill }),
      docxCell([pCell(payload.totals.biscuit, { bold: true, size: 9 })], { shading: totalFill }),
      docxCell([pCell(payload.totals.milk, { bold: true, size: 9 })], { shading: totalFill }),
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
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
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
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন",
                size: 24,
                font: REPORT_FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `মাস: ${payload.monthBn}     সাল: ${payload.yearBn}`,
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
                        new TextRun({ text: "বিদ্যালয়ের নাম: ", bold: true, font: REPORT_FONT_FAMILY }),
                        new TextRun({ text: payload.schoolNameBn, font: REPORT_FONT_FAMILY }),
                      ],
                    }),
                  ]),
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({ text: "EMIS কোড: ", bold: true, font: REPORT_FONT_FAMILY }),
                        new TextRun({ text: payload.emisCode, font: REPORT_FONT_FAMILY }),
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
                        new TextRun({ text: "জেলা: ", bold: true, font: REPORT_FONT_FAMILY }),
                        new TextRun({ text: payload.district, font: REPORT_FONT_FAMILY }),
                      ],
                    }),
                  ]),
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({ text: "উপজেলা: ", bold: true, font: REPORT_FONT_FAMILY }),
                        new TextRun({ text: payload.upazila, font: REPORT_FONT_FAMILY }),
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
                        new TextRun({ text: "ইউনিয়ন: ", bold: true, font: REPORT_FONT_FAMILY }),
                        new TextRun({ text: payload.union, font: REPORT_FONT_FAMILY }),
                      ],
                    }),
                  ]),
                  docxCell([
                    new Paragraph({
                      children: [
                        new TextRun({ text: "ক্লাস্টার: ", bold: true, font: REPORT_FONT_FAMILY }),
                        new TextRun({ text: payload.cluster, font: REPORT_FONT_FAMILY }),
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
  const safeCode = payload.emisCode.replace(/[^a-zA-Z0-9-_]/g, "_");
  const ym = `${period.year}-${String(period.month).padStart(2, "0")}`;
  const base = `monthly-food-report-${safeCode}-${ym}`;

  if (format === "pdf") {
    const buffer = await buildSchoolDistributionMonthPdf(payload);
    return {
      buffer,
      contentType: "application/pdf",
      filename: `${base}.pdf`,
    };
  }

  const buffer = await buildSchoolDistributionMonthDocx(payload);
  return {
    buffer,
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: `${base}.docx`,
  };
};