import { ObjectId } from "mongodb";
import schoolModel from "../school/school.model";
import { IFoodDistribution } from "./distribution.interface";
import { FoodDistribution } from "./distribution.model";
import { User } from "../user/user.model";
import mongoose, { get, Types } from "mongoose";
import moment from "moment-timezone";
import { exportSchoolDistributionMonthlyReport, getSchoolDistributionMonthlyReport } from "./distribution.report";


// create distribution service function 


const createDistribution = async (payload: IFoodDistribution) => {
  const school = await schoolModel.findById(payload.schoolId);

  if (!school) {
    throw new Error("School not found");
  }

  // existing distribution check
  let distribution = await FoodDistribution.findOne({
    schoolId: payload.schoolId,
    date: payload.date,
  });

  if (distribution) {
    // 🔥 duplicate food check
    const existingFoods = distribution.items.map((item) =>
      item.food.toLowerCase()
    );

    for (const newItem of payload.items) {
      if (existingFoods.includes(newItem.food.toLowerCase())) {
        throw new Error(`Food "${newItem.food}" already exists for this date`);
      }
    }

    // ✅ push new items
    distribution.items.push(...payload.items);

    await distribution.save();

    return distribution;
  }

  // ✅ new distribution create
  const newDistribution = await FoodDistribution.create(payload);

  return newDistribution;
};
// create bulk distribution service function

const createBulkDistribution = async (payload: IFoodDistribution[]) => {
  const createdDistributions = [];

  for (const distributionData of payload) {
    const distribution = await createDistribution(distributionData);
    createdDistributions.push(distribution);
  }

  return createdDistributions;
};
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


const getDistributionBySchoolIdLast = async (schoolId: string) => {

  const objectId = new Types.ObjectId(schoolId)
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  // 🔹 Step 1: Try to get today's data
  const todayData = await FoodDistribution.findOne({
    schoolId: objectId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["submitted", "confirmed"] },
  }).sort({ createdAt: -1 });

  if (todayData) {
    return todayData; // ✅ আজকেরটাই return
  }

  // 🔹 Step 2: না থাকলে past থেকে latest data (future বাদ)
  const lastData = await FoodDistribution.findOne({
    schoolId,
    date: { $lt: startOfDay }, //  future বাদ
    status: { $in: ["submitted", "confirmed"] },
  }).sort({ date: -1 });

  return lastData;
};

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




const getSchoolDistributionMonthlyReportService = async (
  schoolId: string,
  month: number,
  year: number
) => {
  return getSchoolDistributionMonthlyReport(schoolId, month, year);
};

const exportSchoolDistributionMonthlyReportService = async (
  payload: any,
  format: "pdf" | "docx",
  period: { year: number; month: number }
) => {
  return exportSchoolDistributionMonthlyReport(payload, format, period);
};

export const distributionServices = {
  createDistribution,
  createBulkDistribution,
  getAllDistributions,
  getDistributionById,
  updateDistributionById,
  deleteDistributionById,
  getDistributionBySchoolAndDate,
  getDistributionForBranchManager,
  getDistributionBySchoolIdLast,

  getSchoolDistributionMonthlyReport: getSchoolDistributionMonthlyReportService,
  exportSchoolDistributionMonthlyReport: exportSchoolDistributionMonthlyReportService,
};