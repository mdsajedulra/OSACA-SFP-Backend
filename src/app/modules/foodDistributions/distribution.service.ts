import { ObjectId } from "mongodb";
import schoolModel from "../school/school.model";
import { IFoodDistribution } from "./distribution.interface";
import { FoodDistribution } from "./distribution.model";
import { User } from "../user/user.model";
import mongoose, { get, Types } from "mongoose";
import moment from "moment-timezone";


// create distribution service function 


const createDistribution = async (payload: IFoodDistribution) => {


    const school = await schoolModel.findById(payload.schoolId);

    if (!school) {
        throw new Error("School not found");
    }

    const existingDistribution = await FoodDistribution.findOne({
        schoolId: payload.schoolId,
        date: payload.date,
    });

    if (existingDistribution) {
        throw new Error("Distribution for this school and date already exists");
    }
    const distribution = await FoodDistribution.create(payload);
    return distribution;

}

// get all distribution

const getAllDistributions = async () => {
    const distributions = await FoodDistribution.find().populate("schoolId").populate("upazilaId");
    return distributions;
}



// get distribution by id

const getDistributionById = async (id: ObjectId) => {
    const distribution = await FoodDistribution.findById(id);
    return distribution;
}
// update distribution by id


const updateDistributionById = async (id: ObjectId, payload: Partial<IFoodDistribution>) => {
    const distribution = await FoodDistribution.findByIdAndUpdate(id, payload, { new: true });
    return distribution;
}

// delete distribution by id
const deleteDistributionById = async (id: ObjectId) => {
    await FoodDistribution.findByIdAndDelete(id);
    return;
}

// get distribution by school id and date 
const getDistributionBySchoolAndDate = async (schoolId: ObjectId, date: Date) => {
    const distribution = await FoodDistribution.findOne({ schoolId, date });
    return distribution;
}


// get distribution by school id
const getDistributionBySchoolIdLast = async (schoolId: ObjectId) => {
    console.log(schoolId)
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();
    const data = await FoodDistribution.findOne({
        schoolId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["submitted", "confirmed"] },
    })
        .sort({ createdAt: -1 });



    return data;
}


// branch manager get distribution for their upazila 




const getDistributionForBranchManager = async (email: string) => {
  const upazilaManager = await User.findOne({ email })
    .populate<{ accessUpazila: { _id: Types.ObjectId } }>("accessUpazila"); // typeScript ignore for now

  const upazilaIdRaw = upazilaManager?.accessUpazila?._id;

  if (!upazilaIdRaw) {
    throw new Error("This user has no accessUpazila assigned or populate failed");
  }

  // convert string/ObjectId safely
  const upazilaId = typeof upazilaIdRaw === "string" ? new Types.ObjectId(upazilaIdRaw) : upazilaIdRaw;

  console.log("Querying for Upazila ID:", upazilaId);

  const distribution = await FoodDistribution.find({ upazilaId }).populate("schoolId").populate("upazilaId"); // populate school name and address

  console.log("Distribution found:", distribution.length);

  return distribution;
};



export const distributionServices = {
    createDistribution,
    getAllDistributions,
    getDistributionById,
    updateDistributionById,
    deleteDistributionById,
    getDistributionBySchoolAndDate,

    // get distribution for branch manager
    getDistributionForBranchManager,
    getDistributionBySchoolIdLast
}
