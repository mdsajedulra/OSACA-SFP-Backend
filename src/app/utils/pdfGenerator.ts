import puppeteer from "puppeteer";

export const generatePDF = async (html: string) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();

  await page.addStyleTag({
  content: `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
  `,
});

  await page.setContent(html, { waitUntil: "load" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};

