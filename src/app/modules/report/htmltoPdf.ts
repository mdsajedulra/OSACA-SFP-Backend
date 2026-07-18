import puppeteer from "puppeteer";

const htmlToPdf = async (html: string, pdfOptions?: any): Promise<Buffer> => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" , timeout: 0,});
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
      timeout: 0,
      ...pdfOptions,
    });

    await page.close();
    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
};

export default htmlToPdf;