import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { schoolService } from "./school.service";
import { ObjectId } from "mongodb";
import XLSX from "xlsx";
import { ISchool } from "./school.interface";
import fs from "fs";

const createSchool = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const result = await schoolService.createSchool(payload);
  sendResponse(res, {
    message: "School created Successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

// school login

const schoolLogin = catchAsync(async (req, res, next) => {
  const payload = req.body;
  // console.log(payload);
  const result = await schoolService.schoolLogin(payload);
  sendResponse(res, {
    message: "School logged in Successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});
// get all school

const getAllSchool = catchAsync(async (req, res, next) => {
  const result = await schoolService.getAllSchool();
  sendResponse(res, {
    message: "school get successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

// update school
const updateSchool = catchAsync(async (req, res, next) => {
  const id = req.params.id as unknown as ObjectId;
  // console.log(id, req.body);

  const result = await schoolService.updateSchool(id, req.body);
  sendResponse(res, {
    message: "school data update successfully",
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});
// create bulk school

const bulkSchool = catchAsync(async (req, res) => {
  const filePath = req.file?.path as string;
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  const schools = data.map((row: any) => ({
    schoolName: row.schoolName,
    schoolCode: row.schoolCode,
    password: row.password,
    concernMobileNumber: row.concernMobileNumber,
    concernName: row.concernName,
    totalTeacher: row.totalTeacher,
    totalStudent: row.totalStudent,
    showDetails: row.showDetails,
    address: {
      village: row.village,
      union: row.union,
      upazila: row.upazila,
      district: row.district,
      division: row.division,
    },
  }));

  // console.log(schools);
  const result = await schoolService.bulkSchool(schools as any);
  fs.unlinkSync(filePath);
  sendResponse(res, {
    message: "Schools created successfully",
    statusCode: StatusCodes.CREATED,
    success: true,
    data: result,
  });
});

export const schoolController = {
  createSchool,
  schoolLogin,
  getAllSchool,
  updateSchool,
  bulkSchool,
};
