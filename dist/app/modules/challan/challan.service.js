"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.buildSingleHTML = buildSingleHTML;
const toBanglaNumber_1 = require("../../utils/toBanglaNumber");
const challanHTML_1 = require("../../utils/challanHTML");
function formatDate(date) {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString();
    return `${(0, toBanglaNumber_1.toBanglaNumber)(+d)}/${(0, toBanglaNumber_1.toBanglaNumber)(+m)}/${(0, toBanglaNumber_1.toBanglaNumber)(+y)}`;
}
function buildSingleHTML(c, logoBase64) {
    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{ margin:0; padding:0; box-sizing:border-box; }
  body{
    font-family:'Noto Serif Bengali',serif;
    background:#fff;
    width:10in;
    height:15in;
    display:grid;
    grid-template-columns:1fr 1fr;
    grid-template-rows:1fr 1fr;
    gap:4px;
    padding:6px;
    position:relative; border: 1px solid #000;
  }
/* Horizontal guide line */
.guide-x {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    border-top: 1px dashed red;
    pointer-events: none;
}

/* Vertical guide line */
.guide-y {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    border-left: 1px dashed blue;
    pointer-events: none;
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
  <div class="guide-x"></div>
    <div class="guide-y"></div>

${(0, challanHTML_1.challanHTML)(c, logoBase64)}



${(0, challanHTML_1.challanHTML)(c, logoBase64)}




${(0, challanHTML_1.challanHTML)(c, logoBase64)}




${(0, challanHTML_1.challanHTML)(c, logoBase64)}



 
</body>
</html>`;
}
