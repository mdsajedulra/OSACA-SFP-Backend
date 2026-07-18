import { getBdMonthRange } from "../../utils/getBDMonthRange";
import { FoodDistribution } from "../foodDistributions/distribution.model";

import htmlToPdf from "./htmltoPdf";
import savePdf from "./savePdf";
import buildFullHTMLform4 from "./templates/form04.template";


const form4Report = async(year: number,month: number)=>{

  const {start, end} = getBdMonthRange(year, month)
  console.log(start, end)

    const distributions = await FoodDistribution.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    { $sort: { date: 1 } },
    {
      $group: {
        _id: "$schoolId",
        distributions: { $push: "$$ROOT" },
        totalCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "schools",
        localField: "_id",
        foreignField: "_id",
        as: "school",
      },
    },
    { $unwind: "$school" },
    { $sort: { "school.name": 1 } },

    // $unwind: "$school" এর পরে
{
  $lookup: {
    from: "upazilas",          // তোমার upazila collection নাম
    localField: "school.address.upazilaId",
    foreignField: "_id",
    as: "upazila",
  },
},
{ $unwind: { path: "$upazila", preserveNullAndEmptyArrays: true } },
  ]);

  const html = buildFullHTMLform4(distributions, month, year)

  const pdf = await htmlToPdf(html);
  const filepath =  savePdf(pdf, "form4")

  return filepath


}
export const reportServices = {
  form4Report,
};

