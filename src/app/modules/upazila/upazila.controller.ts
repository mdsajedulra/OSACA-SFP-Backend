import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { upazilaService } from "./upazila.service";
import { ObjectId } from "mongoose";

const createUpazila = catchAsync(async (req, res, next) => {
  const result = await upazilaService.createUpazila(req.body);
  sendResponse(res, {
    message: "upazila create successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});
const getAllUpazila = catchAsync(async (req, res, next) => {
  const result = await upazilaService.getAllUpazila();
  sendResponse(res, {
    message: "upazila retrieved successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

const getSingleUpazila = catchAsync(async (req, res, next) => {
  const id = req.params.id as unknown as ObjectId;
  const result = await upazilaService.getSingleUpazila(id);
  sendResponse(res, {
    message: "Single upazila retrieved successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

const updateUpazila = catchAsync(async (req, res, next) => {
  const id = req.params.id as unknown as ObjectId;
  const result = await upazilaService.updateUpazila(id, req.body);
  sendResponse(res, {
    message: "upazila updated successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

export const upazilaController = {
  createUpazila,
  getAllUpazila,
  getSingleUpazila,
  updateUpazila,
};
