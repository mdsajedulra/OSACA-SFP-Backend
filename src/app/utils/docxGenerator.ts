import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";

export const generateDocx = async (data: any[]) => {
  const rows = data.map(
    (d) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(d.date.toString())] }),
          new TableCell({ children: [new Paragraph(d.days.toString())] }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph("Monthly Food Report"),
          new Table({ rows }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};