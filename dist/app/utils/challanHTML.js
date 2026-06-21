"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challanHTML = challanHTML;
const toBaangla_1 = require("./toBaangla");
const toBanglaNumber_1 = require("./toBanglaNumber");
const FIXED = {
    supplier: {
        name: "অর্গানাইজেশন ফর সোসাল এডভান্সমেন্ট এন্ড কালচারাল এক্টিভিটিস (ওসাকা)",
        address: "চরগড়গড়ি, ঈশ্বরদী, পাবনা",
        mobile: "০১৩৫৭-১৩১৮৬৪",
        email: "osacaservice1994@gmail.com",
    },
    buyer: {
        title: "প্রকল্প পরিচালক",
        desc: "সরকারি প্রাথমিক বিদ্যালয়ে ফিডিং কর্মসূচি <br/> প্রাথমিক শিক্ষা অধিদপ্তর, <br/> সেকশন-২, মিরপুর, ঢাকা",
    },
    bankNo: "38.01.0000.012.07.073.25-212",
};
function challanHTML(c, logoBase64) {
    const allFoods = [
        "বনরুটি (১২০ গ্রাম)",
        "কলা (১০০ গ্রাম)",
        "সিদ্ধ ডিম (৬০ গ্রাম)",
    ];
    const sentRows = allFoods
        .map((food, i) => `
    <tr>
    <td style="text-align:center">${(0, toBaangla_1.toBangla)(i + 1)}</td>
    <td style="font-size:14px; text-align: center" >${food}</td>
    <td style=" font-weight:${food.slice(0, 3) === c.foodName.slice(0, 3) ? "700" : "400"};text-align:center; font-size:15px;">
    ${food.slice(0, 3) === c.foodName.slice(0, 3) ? (0, toBanglaNumber_1.toBanglaNumber)(c.quantity) : ""}
    </td>
    <td></td>
    </tr>`)
        .join("");
    const recvRows = allFoods
        .map((food, i) => `
    <tr>
    <td style="text-align:center;">${(0, toBaangla_1.toBangla)(i + 1)}</td>
    <td style="font-size:14px; text-align:center;">${food}</td>
    <td></td>
    <td></td>
    </tr>`)
        .join("");
    const logoTag = logoBase64
        ? `<img src="${logoBase64}" style="height:56px;object-fit:contain;" alt="OSACA"/>`
        : `<div class="logo-name">osaca</div>`;
    return `
  <div class="challan">  
  <table>
  <tr>
  <td class="top-td" style="width:28%">
  <div class="serial form-badge " style="width:50%">${(0, toBaangla_1.toBangla)(Number(c.pdOfficeSerial))}/</div>
  <div class="challan-no ">চালান নম্বর: ${(0, toBanglaNumber_1.toBanglaNumber)(Number(c.challanNo))}</div>
  </td>
  <td class="top-td" style="width:44%;text-align:center;">
  ${logoTag}

  </td>
 
  
  <td class="top-td " style=" padding:3px 4px;width:28%;text-align:right;font-weight:700;font-size:12px;white-space:nowrap;">
  <div class="form-badge">ফরম — ৩</div> 
  <br/>
    তারিখ: ${c.date}
  </td>
  </tr>
  </table>
  
  <div class="title-bar">ডেলিভারি চালান</div>
  
  <table style="margin-bottom: none;">
  <tr style="margin-bottom:0;">
  <td style="width:58%; margin-bottom:none; ">
  <span class="sec-head" style="margin: 0;">সরবরাহকারীর ঠিকাদারের বিবরণ:</span>
  <div class="frow">
  <span class="fl" style="font-size:11.5px;">প্রতিষ্ঠানের নাম</span>
  <span class="fv" style="font-size:11.5px;line-height:1.2;">: ${FIXED.supplier.name}</span>
  </div>
  <div class="frow"><span class="fl">ঠিকানা</span><span class="fv">: ${FIXED.supplier.address}</span></div>
  <div class="frow"><span class="fl">মোবাইল নম্বর</span><span class="fv">: ${FIXED.supplier.mobile}</span></div>
  <div class="frow"><span class="fl">ই-মেইল</span><span class="fv" style="white-space:nowrap; font-size:10px;">: ${FIXED.supplier.email}</span></div>
  </td>
  <td style="width:42%">
  <span class="sec-head" >ক্রেতার বিবরণ:</span>
  <div style="font-size:11.5px; line-height:1.2;">${FIXED.buyer.title}</div>
  <div style="font-size:11.5px;line-height:1.2;">${FIXED.buyer.desc}</div>
  </td>
  </tr>
  </table>
  
  <table style="margin-top:2px;">
  <tr>
  <td style="width:58%">
  <span class="sec-head">সরবরাহের স্থান:</span>
  <div class="frow"><span class="fl">বিদ্যালয়ের নাম</span><span class="fv">: ${c.schoolName}</span></div>
  <div class="frow"><span class="fl">EMIS কোড</span><span class="fv">: ${(0, toBanglaNumber_1.toBanglaNumber)(Number(c.schoolCode))}</span></div>
  <div class="frow"><span class="fl">ইউনিয়ন</span><span class="fv">: ${c.union}</span></div>
  <div class="frow"><span class="fl">উপজেলা</span><span class="fv">: ${c.upazila}</span></div>
  <div class="frow"><span class="fl">জেলা</span><span class="fv">: ${c.district}</span></div>
  </td>
  <td style="width:42%;vertical-align:middle; ">
  <div class="bank-label sec-head"">রেফারেন্স নম্বর (চুক্তি নম্বর):</div>
  <div class="bank-no sec-head"">${FIXED.bankNo}</div>
  </td>
  </tr>
  </table>
  
  <table>
  <tr><td colspan="4" style="padding:0;border-bottom:none; border-top: none;">
  <span class="sec-head bg-gray" style="padding-left:5px; "> লোডিং বিবরণ:</span>
  </td></tr>
  <tr>
  <th style="width:15% " >ক্রমিক নং</th>
  <th style="width:30%">খাদ্যের বিবরণ</th>
  <th style="width:25%; ">মোট প্যাকেট/পিস</th>
  <th style="width:48%">মন্তব্য</th>
  </tr>
  ${sentRows}
  </table>
  
  <table>
  <tr><td colspan="4" style="padding:0;border-bottom:none; border-top: none;">
  <span class="sec-head bg-gray" style="padding-left:5px;"> ডেলিভারি (গ্রহণ) বিবরণ:</span>
  </td></tr>
  <tr>
  <th style="width:15%">ক্রমিক নং</th>
  <th style="width:30%">খাদ্যের বিবরণ</th>
  <th style="width:25%; ">মোট প্যাকেট/পিস</th>
  <th style="width:48%">মন্তব্য</th>
  </tr>
  ${recvRows}
  </table>
 

  
  <table  style="margin-top:5px;">
  <tr>

  <td style="width:50%;" >
  <div style="line-height:11px; padding:0px; margin-top: 2px; text-align:justify; font-size: 11px;">উপরের বিবরণ অনুযায়ী খাদ্যসামগ্রী স্পেসিফিকেশন অনুযায়ী  ভালো অবস্থায় .................. তারিখ ...................ঘটিকায় সরবরাহ করা হলো । </div>
  <div class="sign-title">সরবরাহকারীর স্বাক্ষর ও তারিখ :</div>
  <div class="frow"><span class="f2">নাম</span><span class="fv">: ${c.concernedOfficerName}</span></div>
  <div class="frow"><span class="f2">পদবি</span><span class="fv">: ${c.concernedOfficerDesignation}</span></div>
  <div class="frow"><span class="f2">মোবাইল নম্বর</span><span class="fv">: ${c.concernedOfficerNumber}</span></div>
  
  </td>
  <td style="width:50%">
  <div style="line-height:11px; padding:0px; margin-top: 2px; text-align:justify; font-size: 11px;">উপরের বিবরণ অনুযায়ী খাদ্যসামগ্রী স্পেসিফিকেশন অনুযায়ী ভালো অবস্থায় ......................তারিখ ...................ঘটিকায় গ্রহণ করা হলো । </div>
  <div class="sign-title">গ্রহণকারীর স্বাক্ষর, তারিখ ও সিল :</div>
   <div class="frow"><span class="f2">নাম</span><span class="fv">: </span></div>
  <div class="frow"><span class="f2">পদবি</span><span class="fv">: </span></div>
  <div class="frow"><span class="f2">মোবাইল নম্বর</span><span class="fv">: </span></div>

  </td>
  </tr>
  </table>
  
  </div>`;
}
