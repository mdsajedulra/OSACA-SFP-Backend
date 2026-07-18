// utils/savePdf.ts
import fs from "fs";
import path from "path";


const savePdf = (pdf: Buffer, reportName: string): string => {
    const REPORTS_DIR = path.join(process.cwd(), "exports", `${reportName}`);
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const fileName = `${reportName}-${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);
  fs.writeFileSync(filePath, pdf);

  return filePath;
};

export default savePdf;