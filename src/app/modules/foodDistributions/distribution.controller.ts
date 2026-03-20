import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { distributionServices } from "./distribution.service";
import { ObjectId } from "mongodb";
import { get } from "mongoose";

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

export const distributionController = {
    createDistribution,
    getDistributionById,
    getAllDistributions,
    updateDistributionById,
    deleteDistributionById,
}