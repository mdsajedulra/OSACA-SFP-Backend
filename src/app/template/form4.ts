import { formatDate } from "../utils/formatDate";
import { toBangla } from "../utils/toBaangla";
import { toBanglaNumber } from "../utils/toBanglaNumber";

const buildSchoolPage = (
  dist: any,
  monthName: string,
  year: number,
): string => {
  const school = dist.school;
  const MIN_ROWS = 30;

  // Data rows
  // ⚠️ field name (bread, egg, banana, biscuit, milk, challanNo, challanDate)
  //    তোমার FoodDistribution model অনুযায়ী adjust koro

  let challanInfo;
console.log(challanInfo)
  const rows = dist.distributions
    .map((d: any, i: number) =>
      d.items.map((items: any) => {
        challanInfo = `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${formatDate(d.date)}</td>
                      <td>${d.items.map((challanNO: number) => toBangla(challanNO))}</td>
                      <td>${formatDate(d.date)}</td>
                      <td>${toBanglaNumber(items.bread || "")}</td>
                      <td>${toBanglaNumber(items.egg || "")}</td>
                      <td>${toBanglaNumber(items.items?.banana || "")}</td>
                      <td>${toBanglaNumber(items?.biscuit || "")}</td>
                      <td>${toBanglaNumber(items?.milk || "")}</td>
                      <td></td>
                      <td></td>
                    </tr>`;
      }),
    )
    .join("");


  // ৩০ পর্যন্ত empty rows fill
  const emptyCount = Math.max(0, MIN_ROWS - dist.distributions.length);
  const emptyRows = Array.from({ length: emptyCount })
    .map(
      (_, i) => `
      <tr>
        <td>${toBanglaNumber(dist.distributions.length + i + 1)}</td>
        <td></td><td></td><td></td><td></td><td></td>
        <td></td><td></td><td></td><td></td><td></td>
      </tr>`,
    )
    .join("");

  // মোট calculation
  const total = dist.distributions.reduce(
    (acc: any, d: any) => {
      acc.bread += d.items.bread ?? 0;
      acc.egg += d.items.egg ?? 0;
      acc.banana += d.items.banana ?? 0;
      acc.biscuit += d.items.biscuit ?? 0;
      acc.milk += d.items.milk ?? 0;
      return acc;
    },
    { bread: 0, egg: 0, banana: 0, biscuit: 0, milk: 0 },
  );

  return `
  <div class="page">
 
    <!-- Header -->
    <div class="header">
      <span class="form-no">ফরম-০৪</span>
      <h1>সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি</h1>
      <h2>বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন</h2>
      <div class="month-line">
        মাস: <span class="fill">${monthName}</span> &nbsp;&nbsp; সাল: <span class="fill">${toBanglaNumber(year)}</span>
      </div>
    </div>
 
    <!-- Info table -->
    <table class="info-table">
      <tr>
        <td style="width:60%"><span class="label">বিদ্যালয়ের নাম:</span> ${school?.name ?? ""}</td>
        <td style="width:40%"><span class="label">EMIS কোড:</span> ${school?.emisCode ? toBanglaNumber(school.emisCode) : ""}</td>
      </tr>
      <tr>
        <td><span class="label">জেলা:</span> ${school?.district ?? ""}</td>
        <td><span class="label">উপজেলা:</span> ${school?.upazila ?? ""}</td>
      </tr>
      <tr>
        <td><span class="label">ইউনিয়ন:</span> ${school?.union ?? ""}</td>
        <td><span class="label">ক্লাস্টার:</span> ${school?.cluster ?? ""}</td>
      </tr>
    </table>
 
    <!-- Main table -->
    <table class="main-table">
      <thead>
        <tr>
          <th rowspan="2" style="width:5%">ক্রমিক<br>নম্বর</th>
          <th rowspan="2" style="width:9%">খাদ্য<br>গ্রহণের<br>তারিখ</th>
          <th rowspan="2" style="width:8%">চালান<br>নম্বর</th>
          <th rowspan="2" style="width:9%">চালানের<br>তারিখ</th>
          <th colspan="5">গৃহীত খাদ্যসামগ্রী (পিস/প্যাকেট)</th>
          <th rowspan="2" style="width:11%">গ্রহণকারীর<br>স্বাক্ষর</th>
          <th rowspan="2" style="width:10%">মন্তব্য</th>
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
          <td>${toBanglaNumber(total.bread)}</td>
          <td>${toBanglaNumber(total.egg)}</td>
          <td>${toBanglaNumber(total.banana)}</td>
          <td>${toBanglaNumber(total.biscuit)}</td>
          <td>${toBanglaNumber(total.milk)}</td>
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
        <div class="line">মোবাইল নম্বর:</div>
      </div>
      <div class="sign-box">
        <div class="title">প্রধান শিক্ষকের স্বাক্ষর ও সিল:</div>
        <div class="line">তারিখ:</div>
        <div class="line">মোবাইল নম্বর:</div>
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

// buld Full Html
export const buildFullHTML = (
  distributions: any[],
  monthName: string,
  year: number,
): string => {
  const pages = distributions
    .map((dist) => buildSchoolPage(dist, monthName, year))
    .join("");

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
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
