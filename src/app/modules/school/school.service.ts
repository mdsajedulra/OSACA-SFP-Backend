import { ObjectId } from "mongodb";
import { ISchool, ISchoolLogin } from "./school.interface";
import schoolModel from "./school.model";
import mongoose, { Types } from "mongoose";
import { FoodDistribution } from "../foodDistributions/distribution.model";
import { User } from "../user/user.model";
import { IUpazila } from "../upazila/upazila.interface";
import { QueryBuilder } from "../../builder/QueryBuilder";

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

const getAllSchool = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(schoolModel.find(), query);
  const schools = await queryBuilder
        .filter()
        .paginate()
        .search(["schoolName", "schoolCode"])

  const [data, meta] = await Promise.all([
    schools.build(),
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};
// get school not optimized 

const getAllSchoolNotOptimized = async ()=>{
  const schools = schoolModel.find();
  return schools
}
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

// bulk school update

const bulkSchoolUpdate = async (payload: ISchool[]) => {
  
  const bulkOps = payload.map((school) => ({
    updateOne: {
      filter: { schoolCode: school.schoolCode },
      update: { $set: school },
      upsert: true,
    },
  }));

  const result = await schoolModel.bulkWrite(bulkOps);
  return result;
};






export const schoolService = {
  createSchool,
  schoolLogin,
  getAllSchool,
  getAllSchoolNotOptimized,
  updateSchool,
  bulkSchool,
  getSchoolForBranchManager,
  getSchoolById,
  deleteSchool,
  bulkSchoolUpdate,
};
