"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHTML = void 0;
const generateHTML = (data, school, month, year) => {
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body {
    font-family: 'Noto Sans Bengali', sans-serif;
    padding: 20px;
    font-size: 12px;
  }

  .title {
    text-align: center;
    font-weight: bold;
    font-size: 18px;
  }

  .subtitle {
    text-align: center;
    margin-bottom: 10px;
  }

  .info-table {
    width: 100%;
    border: 1px solid black;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .info-table td {
    border: 1px solid black;
    padding: 5px;
  }

  .main-table {
    width: 100%;
    border-collapse: collapse;
  }

  .main-table th, .main-table td {
    border: 1px solid black;
    text-align: center;
    padding: 4px;
  }

  .header {
    background-color: #d9d9d9;
    font-weight: bold;
  }

  .days-row {
    background-color: #d8ead3;
    font-weight: bold;
  }

  .footer-box {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
  }

  .box {
    width: 48%;
    border: 1px solid black;
    padding: 10px;
    height: 100px;
  }

</style>
</head>

<body>

<div class="title">সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি</div>
<div class="subtitle">বিদ্যালয়ের প্রাপ্ত খাবারের মাসিক প্রতিবেদন</div>

<div style="margin-bottom:10px;">
  মাস: ${month} &nbsp;&nbsp;&nbsp; সাল: ${year}
</div>

<table class="info-table">
  <tr>
    <td>বিদ্যালয়ের নাম: ${school.schoolNameBangla}</td>
    <td>EMIS কোড: ${school.schoolCode}</td>
  </tr>
  <tr>
    <td>জেলা: ${school.address.district}</td>
    <td>উপজেলা: ${school.address.upazilaId.upazilaName}</td>
  </tr>
  <tr>
    <td>ইউনিয়ন: ${school.address.union}</td>
    <td>ক্লাস্টার: </td>
  </tr>
</table>

<table class="main-table">
  <thead>
    <tr class="header">
      <th>ক্রমিক</th>
      <th>তারিখ</th>
      <th>চালান নম্বর</th>
      <th>চালানের তারিখ</th>
      <th>বিস্কুট</th>
      <th>দুধ</th>
      <th>মন্তব্য</th>
    </tr>

    <tr class="days-row">
      ${Array.from({ length: daysInMonth }, (_, i) => `<td>${i + 1}</td>`).join("")}
    </tr>
  </thead>

  <tbody>
    ${Array.from({ length: daysInMonth }, (_, i) => {
        var _a, _b, _c, _d, _e, _f;
        const day = i + 1;
        const row = data.find(d => new Date(d.date).getDate() === day);
        const banana = ((_b = (_a = row === null || row === void 0 ? void 0 : row.items) === null || _a === void 0 ? void 0 : _a.find((i) => i.food === "banana")) === null || _b === void 0 ? void 0 : _b.received) || "";
        const banruti = ((_d = (_c = row === null || row === void 0 ? void 0 : row.items) === null || _c === void 0 ? void 0 : _c.find((i) => i.food === "banruti")) === null || _d === void 0 ? void 0 : _d.received) || "";
        const egg = ((_f = (_e = row === null || row === void 0 ? void 0 : row.items) === null || _e === void 0 ? void 0 : _e.find((i) => i.food === "egg")) === null || _f === void 0 ? void 0 : _f.received) || "";
        return `
        <tr>
          <td>${day}</td>
          <td>${row ? new Date(row.date).toLocaleDateString("bn-BD") : ""}</td>
          <td></td>
          <td></td>
          <td>${egg}</td>
          <td>${banruti}</td>
          <td>${banana}</td>

          <td>${(row === null || row === void 0 ? void 0 : row.remark) || ""}</td>
        </tr>
      `;
    }).join("")}
  </tbody>
</table>

<div class="footer-box">
  <div class="box">
    টিফিন ম্যানেজারের স্বাক্ষর ও সিল
    <br><br>
    মোবাইল নম্বর: ${school.tifinManagerNumber || ""}
  </div>

  <div class="box">
    প্রধান শিক্ষকের স্বাক্ষর ও সিল
    <br><br>
    মোবাইল নম্বর: ${school.headTeacherPhoneNumber}
  </div>
</div>

</body>
</html>
`;
};
exports.generateHTML = generateHTML;
