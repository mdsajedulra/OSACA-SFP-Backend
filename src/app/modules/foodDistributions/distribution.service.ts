import { ObjectId } from "mongodb";
import schoolModel from "../school/school.model";
import { IFoodDistribution } from "./distribution.interface";
import { FoodDistribution } from "./distribution.model";
import { User } from "../user/user.model";
import mongoose, { get, Types } from "mongoose";
import moment from "moment-timezone";
import {
  exportSchoolDistributionMonthlyReport,
  getSchoolDistributionMonthlyReport,
} from "./distribution.report";
import {
  formatChallanNo,
  reserveChallanBlock,
} from "../../utils/challanNumber";
import { generationBatchModel } from "../challanJob/gerationBatch.mode";
import pdfJobModel from "../challanJob/pdfJob.model";
import { QueryBuilder } from "../../builder/QueryBuilder";

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
      item.food.toLowerCase(),
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

const getAllDistributions = async (query: Record<string, string>) => {
  // const distributions = await FoodDistribution.find()
  //   .populate("schoolId")
  //   .populate("upazilaId");
  // const distributions = await FoodDistribution.find()

  const queryBuilder = new QueryBuilder(FoodDistribution.find(), query);

  const totalDistribution = await queryBuilder.filter().paginate().modelQuery
    .populate("schoolId")
    .populate("upazilaId");


  return totalDistribution;
};
// get all distribtions with no optimzaton 

const getAllDistributionsNoOptimized = async ()=>{
   const result = await FoodDistribution.find()
   return result
}
// get distribution by id

const getDistributionById = async (id: ObjectId) => {
  const distribution = await FoodDistribution.findById(id);
  return distribution;
};
// update distribution by id

const updateDistributionById = async (
  id: ObjectId,
  payload: Partial<IFoodDistribution>,
) => {
  const distribution = await FoodDistribution.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return distribution;
};

// delete distribution by id
const deleteDistributionById = async (id: ObjectId) => {
  await FoodDistribution.findByIdAndDelete(id);
  return;
};

// get distribution by school id and date
const getDistributionBySchoolAndDate = async (
  schoolId: ObjectId,
  date: Date,
) => {
  const distribution = await FoodDistribution.findOne({ schoolId, date });
  return distribution;
};

// get distribution by school id

const getDistributionBySchoolIdLast = async (schoolId: string) => {
  const objectId = new Types.ObjectId(schoolId);
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
  const upazilaManager = await User.findOne({ email }).populate<{
    accessUpazila: { _id: Types.ObjectId };
  }>("accessUpazila"); // typeScript ignore for now

  const upazilaIdRaw = upazilaManager?.accessUpazila?._id;

  if (!upazilaIdRaw) {
    throw new Error(
      "This user has no accessUpazila assigned or populate failed",
    );
  }

  // convert string/ObjectId safely
  const upazilaId =
    typeof upazilaIdRaw === "string"
      ? new Types.ObjectId(upazilaIdRaw)
      : upazilaIdRaw;

  console.log("Querying for Upazila ID:", upazilaId);

  const distribution = await FoodDistribution.find({ upazilaId })
    .populate("schoolId")
    .populate("upazilaId"); // populate school name and address

  // console.log("Distribution found:", distribution.length);

  return distribution;
};

const getSchoolDistributionMonthlyReportService = async (
  schoolId: string,
  month: number,
  year: number,
) => {
  return getSchoolDistributionMonthlyReport(schoolId, month, year);
};

const exportSchoolDistributionMonthlyReportService = async (
  payload: any,
  format: "pdf" | "docx",
  period: { year: number; month: number },
) => {
  return exportSchoolDistributionMonthlyReport(payload, format, period);
};

/// creata all entry and generate pdf from here

const MENU: Record<number, string[]> = {
  0: ["bread", "egg"], // রবিবার   → বনরুটি + সিদ্ধ ডিম
  1: ["bread"], // সোমবার   → বনরুটি
  2: ["banana"], // মঙ্গলবার → কলা
  3: ["bread", "egg"], // বুধবার   → বনরুটি + সিদ্ধ ডিম
  4: ["bread", "egg"], // বৃহস্পতি → বনরুটি + সিদ্ধ ডিম
  5: [], // শুক্রবার → অফ
  6: ["bread", "egg"], // শনিবার   → বনরুটি + সিদ্ধ ডিম
};

const FOOD_NAME: Record<string, string> = {
  bread: "বনরুটি",
  egg: "সিদ্ধ ডিম",
  banana: "কলা",
};

// ============================================
// একটা তারিখের জন্য items বানাও
// ============================================
function getItemsForDate(
  date: Date,
  // studentCount: number,
  currentNo: { value: number },
  defaultItems?: number,
) {
  const day = date.getDay(); // 0=রবি, 1=সোম ... 6=শনি
  // console.log(day);
  const foods = MENU[day]; // সেদিনের খাবারের key list

  // শুক্রবার → foods = [] → map করলে [] আসবে
  return foods.map((key) => ({
    food: FOOD_NAME[key],
    sent: defaultItems ?? 1, // প্রতিটা ছাত্রের জন্য ১ পিস
    received: 0, // পরে update হবে
    challanNo: formatChallanNo(currentNo.value++),
  }));
}

const createAllEntry = async (selectedDates: string[], submittedBy: string) => {
  //  async function bulkGenerate(
  //   selectedDates: string[], // ← এটাই বদলালো
  //   submittedBy: string,
  // ) {
  const batchName = Date.now().toString();

  const batch = await generationBatchModel.create({
    name: batchName,
    selectedDates: selectedDates.map((d) => new Date(d)),
    status: "processing",
    generatedBy: submittedBy,
  });

  const schools = await schoolModel.find().lean();

  let totalItems = 0;
  for (const school of schools) {
    for (const dateStr of selectedDates) {
      const dow = new Date(dateStr).getDay();
      totalItems += MENU[dow].length;
    }
  }

  // ২. DB থেকে শুরুর নম্বর নাও
  const firstNo = await reserveChallanBlock(totalItems);

  // ৩. currentNo object বানাও ← এইটুকুই
  const currentNo = { value: firstNo };
  const allDocs: any[] = [];

  for (const school of schools) {
    for (const dateStr of selectedDates) {
      // ← selected dates এ লুপ
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);

      const items = getItemsForDate(
        date,
        // school.numberOfStudent,
        currentNo,
        school?.defaultItems,
      );

      if (items.length === 0) continue; // শুক্রবার automatically skip

      allDocs.push({
        schoolId: school._id,
        upazilaId: school.address.upazilaId,
        date,
        days: 1,
        items,
        status: "submitted",
        submittedBy,
        batchId: batch?._id,
      });
    }
  }

  // বাকি insertMany একই থাকবে
  // const CHUNK = 5000;
  // let inserted = 0;

  // for (let i = 0; i < allDocs.length; i += CHUNK) {
  //   const chunk = allDocs.slice(i, i + CHUNK);
  //   await FoodDistribution.insertMany(chunk, { ordered: false });
  //   inserted += chunk.length;
  // }
  const insertedDocs = await FoodDistribution.insertMany(allDocs, {
    ordered: false,
  });

  // creating batch on batch collection  DB
  await batch.updateOne({
    status: "done",
    totalSchools: schools.length,
    totalDistributions: insertedDocs.length,
    totalChallans: totalItems,
    challanRange: {
      from: formatChallanNo(firstNo),
      to: formatChallanNo(firstNo + totalItems - 1),
    },
  });
  return {
    // totalSchools: schools.length,
    // totalDocs: allDocs.length,
    // inserted,
    all: allDocs.length,
    inserted: insertedDocs.length,
    insertedDocs,
  };
};

// pdf generation from here

const startPdfWorker = async (batchId: string) => {
  const result = await pdfJobModel.create({ batchId });

  if (!result) {
    throw new Error("Failed to create PDF job");
  }
  return "pdf generation started";
};

export const distributionServices = {
  createDistribution,
  createBulkDistribution,
  getAllDistributions,
  getAllDistributionsNoOptimized,
  getDistributionById,
  updateDistributionById,
  deleteDistributionById,
  getDistributionBySchoolAndDate,
  getDistributionForBranchManager,
  getDistributionBySchoolIdLast,

  getSchoolDistributionMonthlyReport: getSchoolDistributionMonthlyReportService,
  exportSchoolDistributionMonthlyReport:
    exportSchoolDistributionMonthlyReportService,
  createAllEntry,
  startPdfWorker,
};
