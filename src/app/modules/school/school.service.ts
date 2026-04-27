import { ObjectId } from "mongodb";
import { ISchool, ISchoolLogin } from "./school.interface";
import schoolModel from "./school.model";
import mongoose, { Types } from "mongoose";
import { FoodDistribution } from "../foodDistributions/distribution.model";
import { User } from "../user/user.model";
import { IUpazila } from "../upazila/upazila.interface";

const createSchool = async (payload: ISchool) => {
  const result = await schoolModel.create(payload);
  return result;
};
const schoolLogin = async (payload: ISchoolLogin) => {
  console.log(payload);
  const school = await schoolModel.find({
    schoolCode: payload.schoolCode,
  });
  if (school.length === 0) {
    throw new Error("School Not Found");
  }
  if (school[0].password !== payload.password) {
    throw new Error("Invalid Password");
  }

  console.log(school);
  return school[0];
};

// get all schools

const getAllSchool = async () => {
  const result = await schoolModel.find();
  return result;
};

// update school data

const updateSchool = async (id: ObjectId, payload: Partial<ISchool>) => {
  console.log(payload);
  const result = await schoolModel.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

// create bulk school

const bulkSchool = async (payload: ISchool[]) => {

  const result = await schoolModel.insertMany(payload, { ordered: false });
  if(result.length==0) throw new Error("Some went wrong, check exel file")
  return result
};



const getSchoolForBranchManager = async (email: string) => {
    const upazilaManager  = await User.findOne({ email: email }).populate<{ accessUpazila: { _id: Types.ObjectId } }>('accessUpazila')

    console.log(upazilaManager?.accessUpazila?._id);
    const school = await schoolModel.find({
        "address.upazilaId": new mongoose.Types.ObjectId(upazilaManager?.accessUpazila?._id),
    }).populate<{ address: { upazilaId: Types.ObjectId } }>('address.upazilaId').populate<{ address: { upazilaId: IUpazila } }>('address.upazilaId');



    return school;
}

// get school by id

const getSchoolById = async (id: ObjectId) => {
  const school = await schoolModel.findById(id);
  return school;
}

// delete school by id

const deleteSchool = async (id: ObjectId) => {
  const result = await schoolModel.findByIdAndDelete(id);
  return result;
} 







export const schoolService = {
  createSchool,
  schoolLogin,
  getAllSchool,
  updateSchool,
  bulkSchool,
  getSchoolForBranchManager,
  getSchoolById,
  deleteSchool
};
