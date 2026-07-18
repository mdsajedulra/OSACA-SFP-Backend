// ============================================================
// src/app/template/form4.ts
// Form-04 Full HTML Builder
// ------------------------------------------------------------
// Usage:
//   const html = buildFullHTML(collection, 7, 2026);
//   collection = aggregation result array (school-wise grouped)
// ============================================================

import { getBengaliFontBase64 } from "../../../utils/logoandfonts";

// ============================================================
// 1. Helpers (self-contained — বাইরের import লাগবে না)
// ============================================================

// English digit → Bengali digit (undefined-safe)
const bnNum = (num?: number | string | null): string => {
  if (num === undefined || num === null || num === "") return "";
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(num).replace(/[0-9]/g, (d) => map[d]);
};

// Date → DD/MM/YY Bengali (Asia/Dhaka timezone)
const bnDate = (date?: Date | string | null): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const dhaka = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const dd = String(dhaka.getDate()).padStart(2, "0");
  const mm = String(dhaka.getMonth() + 1).padStart(2, "0");
  const yy = String(dhaka.getFullYear()).slice(-2);
  return bnNum(`${dd}/${mm}/${yy}`);
};

// 0 বা undefined হলে খালি cell
const cell = (value?: number): string => (value ? bnNum(value) : "");

// Bengali month names (index: 1 = জানুয়ারি)
const BN_MONTHS = [
  "", "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

// ============================================================
// 2. Data Extractors (তোমার items[] structure অনুযায়ী)
// ============================================================

// items array থেকে নির্দিষ্ট খাবারের পরিমাণ
// ⚠️ received দেখাতে চাইলে it.sent → it.received করো
const getFoodQty = (d: any, foodName: string): number => {
  return d?.items?.find((it: any) => it.food === foodName)?.sent ?? 0;
};

// items array থেকে সব challanNo (একাধিক হলে comma দিয়ে)
const getChallanNos = (d: any): string => {
  const nos = d?.items?.map((it: any) => it.challanNo).filter(Boolean) ?? [];
  return nos.map((n: number) => bnNum(n)).join(", ");
};

// Food names (model এ যেভাবে আছে exactly সেভাবে)
const FOODS = {
  BREAD: "বনরুটি",
  EGG: "সিদ্ধ ডিম",
  BANANA: "কলা",
  BISCUIT: "ফর্টিফাইড বিস্কুট",
  MILK: "ইউএইচটি দুধ",
} as const;

// ============================================================
// 3. Single School Page
// ============================================================

const buildSchoolPage = (dist: any, monthName: string, year: number): string => {
  const school = dist.school ?? {};
  const distributions: any[] = dist.distributions ?? [];
  const MIN_ROWS = 30;

  // ----- Data rows -----
  const rows = distributions
    .map(
      (d: any, i: number) => `
      <tr>
        <td>${bnNum(i + 1)}</td>
        <td>${bnDate(d.date)}</td>
        <td>${getChallanNos(d)}</td>
        <td>${bnDate(d.date)}</td>
        <td>${cell(getFoodQty(d, FOODS.BREAD))}</td>
        <td>${cell(getFoodQty(d, FOODS.EGG))}</td>
        <td>${cell(getFoodQty(d, FOODS.BANANA))}</td>
        <td>${cell(getFoodQty(d, FOODS.BISCUIT))}</td>
        <td>${cell(getFoodQty(d, FOODS.MILK))}</td>
        <td></td>
        <td></td>
      </tr>`
    )
    .join("");

  // ----- Empty rows (৩০ পর্যন্ত) -----
  const emptyCount = Math.max(0, MIN_ROWS - distributions.length);
  const emptyRows = Array.from({ length: emptyCount })
    .map(
      (_, i) => `
      <tr>
        <td>${bnNum(distributions.length + i + 1)}</td>
        <td></td><td></td><td></td><td></td><td></td>
        <td></td><td></td><td></td><td></td><td></td>
      </tr>`
    )
    .join("");

  // ----- মোট -----
  const total = distributions.reduce(
    (acc, d) => {
      acc.bread += getFoodQty(d, FOODS.BREAD);
      acc.egg += getFoodQty(d, FOODS.EGG);
      acc.banana += getFoodQty(d, FOODS.BANANA);
      acc.biscuit += getFoodQty(d, FOODS.BISCUIT);
      acc.milk += getFoodQty(d, FOODS.MILK);
      return acc;
    },
    { bread: 0, egg: 0, banana: 0, biscuit: 0, milk: 0 }
  );

  // ----- School info (তোমার school schema অনুযায়ী) -----
  const schoolName = school.schoolNameBangla || school.schoolName || "";
  const emisCode = school.schoolCode || "";
  const district = school.address?.district || "";
  const union = school.address?.union || "";
  // upazila নাম school এ নেই (শুধু upazilaId আছে) —
  // aggregation এ upazila $lookup করলে dist.upazila.name এখানে আসবে
  const upazila =
    dist.upazila?.name || dist.upazila?.upazilaName || school.upazilaName || "";
  const cluster = school.cluster || "";

  return `
  <div class="page">

    <!-- Header -->
    <div class="header">
      <span class="form-no">ফরম-০৪</span>
      <h1>সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি</h1>
      <h2>বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন</h2>
      <div class="month-line">
        মাস: <span class="fill">${monthName}</span> &nbsp;&nbsp; সাল: <span class="fill">${bnNum(year)}</span>
      </div>
    </div>

    <!-- Info table -->
    <table class="info-table">
      <tr>
        <td style="width:60%"><span class="label">বিদ্যালয়ের নাম:</span> ${schoolName}</td>
        <td style="width:40%"><span class="label">EMIS কোড:</span> ${bnNum(emisCode)}</td>
      </tr>
      <tr>
        <td><span class="label">জেলা:</span> ${district}</td>
        <td><span class="label">উপজেলা:</span> ${upazila}</td>
      </tr>
      <tr>
        <td><span class="label">ইউনিয়ন:</span> ${union}</td>
        <td><span class="label">ক্লাস্টার:</span> ${cluster}</td>
      </tr>
    </table>

    <!-- Main table -->
    <table class="main-table">
      <thead>
        <tr>
          <th rowspan="2" style="width:5%">ক্রমিক<br>নম্বর</th>
          <th rowspan="2" style="width:9%">খাদ্য<br>গ্রহণের<br>তারিখ</th>
          <th rowspan="2" style="width:15%">চালান<br>নম্বর</th>
          <th rowspan="2" style="width:9%">চালানের<br>তারিখ</th>
          <th colspan="5">গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)</th>
          <th rowspan="2" style="width:10%">গ্রহণকারীর<br>স্বাক্ষর</th>
          <th rowspan="2" style="width:9%">মন্তব্য</th>
        </tr>
        <tr>
          <th style="width:8%">বনরুটি</th>
          <th style="width:8%">সিদ্ধ ডিম</th>
          <th style="width:8%">কলা</th>
          <th style="width:8%">ফর্টিফাইড<br>বিস্কুট</th>
          <th style="width:8%">ইউএইচটি<br>দুধ</th>
        </tr>
        <tr class="col-index">
          <th>১</th><th>২</th><th>৩</th><th>৪</th><th>৫</th><th>৬</th><th>৭</th><th>৮</th><th>৯</th><th>১০</th><th>১১</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${emptyRows}
        <tr class="total-row">
          <td colspan="4" style="text-align:left; padding-left:8px;">মোট</td>
          <td>${cell(total.bread)}</td>
          <td>${cell(total.egg)}</td>
          <td>${cell(total.banana)}</td>
          <td>${cell(total.biscuit)}</td>
          <td>${cell(total.milk)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <!-- Signature boxes -->
    <div class="sign-grid">
      <div class="sign-box">
        <div class="title">টিফিন ম্যানেজারের স্বাক্ষর ও সিল:</div>
        <div class="line">তারিখ:</div>
        <div class="line">মোবাইল নম্বর: ${bnNum(school.tifinManagerPNumber || "")}</div>
      </div>
      <div class="sign-box">
        <div class="title">প্রধান শিক্ষকের স্বাক্ষর ও সিল:</div>
        <div class="line">তারিখ:</div>
        <div class="line">মোবাইল নম্বর: ${bnNum(school.headTeacherPhoneNumber || "")}</div>
      </div>
      <div class="sign-box">
        <div class="title">সংশ্লিষ্ট ক্লাস্টারের উপজেলা সহকারী প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</div>
        <div class="line">তারিখ:</div>
        <div class="line">মোবাইল নম্বর:</div>
      </div>
      <div class="sign-box">
        <div class="title">উপজেলা প্রাথমিক শিক্ষা অফিসারের স্বাক্ষর ও সিল:</div>
        <div class="line">তারিখ:</div>
        <div class="line">মোবাইল নম্বর:</div>
      </div>
    </div>

  </div>
  `;
};

// ============================================================
// 4. Full HTML Builder (main export)
// ============================================================
// collection = aggregation result array:
// [ { _id, distributions: [...], totalCount, school: {...} }, ... ]

export const buildFullHTMLform4 = (
  collection: any[],
  month: number = 7,
  year: number = 2026
): string => {
  const monthName = BN_MONTHS[month] ?? "";

  const pages = (collection ?? [])
    .map((dist) => buildSchoolPage(dist, monthName, year))
    .join("");

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@font-face {
    font-family: 'Noto Serif Bengali';
    src: url(data:font/ttf;base64,${getBengaliFontBase64()}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Noto Serif Bengali', serif;
    background: #fff;
    color: #000;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 8mm 10mm;
    font-size: 10px;
    page-break-after: always;
  }

  .page:last-child { page-break-after: auto; }

  .header { position: relative; text-align: center; margin-bottom: 4px; }
  .header h1 { font-size: 14px; font-weight: 700; }
  .header h2 { font-size: 11px; font-weight: 600; }

  .form-no {
    position: absolute; top: 0; right: 0;
    border: 1px solid #000; padding: 1px 8px;
    font-size: 10px; font-weight: 600;
  }

  .month-line { font-size: 10px; margin-top: 2px; }
  .month-line .fill {
    display: inline-block; min-width: 60px;
    border-bottom: 1px dotted #000;
    text-align: center; font-weight: 600;
  }

  table { width: 100%; border-collapse: collapse; }

  .info-table { margin-top: 4px; }
  .info-table td { border: 1px solid #000; padding: 2px 5px; font-size: 10px; }
  .info-table .label { font-weight: 700; }

  .main-table { margin-top: 6px; }
  .main-table th, .main-table td {
    border: 1px solid #000; padding: 1px 3px;
    text-align: center; font-size: 9.5px; height: 16px;
  }
  .main-table thead th { font-weight: 600; vertical-align: middle; }
  .main-table .col-index th { background: #eaf3e2; font-weight: 600; height: 14px; }
  .main-table .total-row td { font-weight: 700; }

  .sign-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6px; margin-top: 8px;
  }
  .sign-box {
    border: 1px solid #000; padding: 4px 6px;
    min-height: 62px; font-size: 10px;
  }
  .sign-box .title { font-weight: 700; }
  .sign-box .line { margin-top: 4px; }

  @page { size: A4 portrait; margin: 0; }
</style>
</head>
<body>
${pages}
</body>
</html>`;
};

export default buildFullHTMLform4;