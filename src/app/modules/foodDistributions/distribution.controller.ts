import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { distributionServices } from "./distribution.service";
import { ObjectId } from "mongodb";
import { get, Types } from "mongoose";
import { cleanRegex } from "zod/v4/core/util.cjs";
import { generateHTML } from "../../utils/htmlTemplate";
import { generatePDF } from "../../utils/pdfGenerator";
import schoolModel from "../school/school.model";
import { generateDocx } from "../../utils/docxGenerator";
import { populate } from "dotenv";

const createDistribution = catchAsync(async (req, res)=>{
    const distribution = await distributionServices.createDistribution(req.body);
    sendResponse(res, {
        success: true, 
        statusCode: StatusCodes.CREATED,
        message: "Food distribution created successfully",
        data: distribution,

    })
})

// create bulk distribution

const createBulkDistribution = catchAsync(async (req, res)=>{
    const distributions = await distributionServices.createBulkDistribution(req.body);
    sendResponse(res, {
        success: true, 
        statusCode: StatusCodes.CREATED,
        message: "Food distributions created successfully",
        data: distributions,

    })
})

// get all distribution

const getAllDistributions = catchAsync(async (req, res)=>{
    const distributions = await distributionServices.getAllDistributions();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Food distributions retrieved successfully",
        data: distributions,
    });
});



// get distribution by id 

const getDistributionById = catchAsync(async (req, res)=>{
    const distribution = await distributionServices.getDistributionById(req.params.id as unknown as ObjectId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Distribution found successfully",
        data: distribution,
    });
});

// update distribution by id

const updateDistributionById = catchAsync(async (req, res)=>{
    const distribution = await distributionServices.updateDistributionById(req.params.id as unknown as ObjectId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Distribution updated successfully",
        data: distribution,
    });
})

// delete distribution by id

const deleteDistributionById = catchAsync(async (req, res)=>{
    await distributionServices.deleteDistributionById(req.params.id as unknown as ObjectId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Distribution deleted successfully",
    });
})
// get distribution by school id 

const getDistributionBySchoolIdLast = catchAsync(async (req, res)=>{
    const distribution = await distributionServices.getDistributionBySchoolIdLast(req.params.id as string);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Distribution found successfully",
        data: distribution,
    });
})

// get 


// get distribution for branch manager

const getDistributionForBranchManager = catchAsync(async (req, res)=>{

    const user = req.user;
    console.log(user)
    
    const distributions = await distributionServices.getDistributionForBranchManager(user?.email);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Distributions retrieved successfully",
        data: distributions,
    });

})

// 

export const getSchoolDistributionReport = catchAsync(async (req, res) => {
  const schoolId = String(req.params.schoolId);
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  const type = String(req.query.type ?? "").toLowerCase() as "pdf" | "docx";

  if (!Types.ObjectId.isValid(schoolId)) {
    throw new Error("Invalid schoolId");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Query "month" must be an integer from 1 to 12');
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Query "year" must be a valid year');
  }

  if (type !== "pdf" && type !== "docx") {
    throw new Error('Query "type" must be pdf or docx');
  }

  const payload = await distributionServices.getSchoolDistributionMonthlyReport(
    schoolId,
    month,
    year
  );

  const { buffer, contentType, filename } =
    await distributionServices.exportSchoolDistributionMonthlyReport(
      payload,
      type,
      { year, month }
    );

  const body = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  res.status(StatusCodes.OK);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(body.length));
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  return res.end(body);
});

export const distributionController = {
    createDistribution,
    createBulkDistribution,
    getDistributionById,
    getAllDistributions,
    updateDistributionById,
    deleteDistributionById,
    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast,
    getSchoolDistributionReport
    
    
}