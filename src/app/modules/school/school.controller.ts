import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { schoolService } from "./school.service";
import { ObjectId } from "mongodb";
import XLSX from "xlsx";

import fs from "fs";
import { Types } from "mongoose";
import { ISchool } from "./school.interface";



type ExcelRow = {
  schoolName: string;
  schoolNameBangla: string;
  schoolCode: string;
  password: string;

  headTeacherPhoneNumber: string;
  headTeacherName: string;

  tifinManager?: string;
  tifinManagerNumber?: string;


  totalStudent: number | string;


defaultItem: number | string;
  upazilaId: string;
  union: string;
  district: string;
};

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

  const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

  console.log(data);
  
  const schools = data.map((row) => ({
    schoolName: row.schoolName,
    schoolNameBangla: row.schoolNameBangla,
    schoolCode: row.schoolCode,
    password: row.password,
    headTeacherPhoneNumber: row.headTeacherPhoneNumber,
    headTeacherName: row.headTeacherName,
    tifinManager: row.tifinManager || "",
    tifinManagerPNumber: row.tifinManagerNumber || "", 
   
    totalStudent: Number(row.totalStudent),

    // ✅ STRING (URL / link)

    // ✅ required field
    
    defaultItems: Number(row.defaultItem) || 0,

    address: {
      upazilaId:  row.upazilaId,
      union: row.union,
      district: row.district,
    },
  }));


console.log(schools);

  const result = await schoolService.bulkSchool(schools as unknown as ISchool[]);

  fs.unlinkSync(filePath);

  sendResponse(res, {
    message: "Schools created successfully",
    statusCode: StatusCodes.CREATED,
    success: true,
    data: result,
  });
});

// get school for branch manager

const getSchoolForBranchManager = catchAsync(async (req, res) => {
    const email = req.user?.email as string;
    const result = await schoolService.getSchoolForBranchManager(email);
    sendResponse(res, {
      message: "Schools retrieved successfully",
      statusCode: StatusCodes.OK,
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
  getSchoolForBranchManager
};
