import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { distributionServices } from "./distribution.service";
import { ObjectId } from "mongodb";
import { get } from "mongoose";
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

const schoolReport = catchAsync(async (req, res)=>{

    const { schoolId } = req.params;
  const { month, year, type } = req.query;

  const data = await distributionServices.schoolReport(
    schoolId as string,
    Number(month),
    Number(year)
  );


  const school = await schoolModel.findById(schoolId).populate("address.upazilaId").lean();
console.log("School found:", school);

  if (type === "pdf") {
    const html = generateHTML(data, school);
    const pdf = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=report.pdf",
    });

    return res.send(pdf);
  }

  if (type === "docx") {
    const docx = await generateDocx(data);

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=report.docx",
    });

    return res.send(docx);
  }
})

export const distributionController = {
    createDistribution,
    getDistributionById,
    getAllDistributions,
    updateDistributionById,
    deleteDistributionById,
    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast,
    schoolReport
}