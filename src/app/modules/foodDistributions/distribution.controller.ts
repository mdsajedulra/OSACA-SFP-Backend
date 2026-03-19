import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { distributionServices } from "./distribution.service";
import { ObjectId } from "mongodb";

const createDistribution = catchAsync(async (req, res)=>{
    const distribution = await distributionServices.createDistribution(req.body);
    sendResponse(res, {
        success: true, 
        statusCode: StatusCodes.CREATED,
        message: "Food distribution created successfully",
        data: distribution,

    })
})

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

export const distributionController = {
    createDistribution,
    getDistributionById,
}