import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reportServices } from "./report.services";

const form4Report = catchAsync(async (req, res) => {
    const report = await reportServices.form4Report();
    console.log(report)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Report generated successfully",
        data: report,
    });

})


export const reportController ={
    form4Report
}