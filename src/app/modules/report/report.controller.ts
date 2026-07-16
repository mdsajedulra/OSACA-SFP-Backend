import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reportServices } from "./report.services";

const form4Report = catchAsync(async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  console.log("year", year, "month", month);

  const pdf = await reportServices.form4Report(year, month);

 

  sendResponse(
    // res.set({
    //   "Content-Type": "application/pdf",
    //   "Content-Disposition": `attachment; filename="form4_report_${year}_${month}.pdf"`,
    //   "Content-Length": pdf.length,
    // }),
    res,
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Report generated successfully",
      data: pdf,
    },
  );
});

export const reportController = {
  form4Report,
};
