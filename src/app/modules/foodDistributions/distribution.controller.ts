import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { distributionServices } from "./distribution.service";
import { ObjectId } from "mongodb";
import { get } from "mongoose";
import { cleanRegex } from "zod/v4/core/util.cjs";

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

export const distributionController = {
    createDistribution,
    getDistributionById,
    getAllDistributions,
    updateDistributionById,
    deleteDistributionById,
    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast
}