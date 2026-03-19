import { ObjectId } from "mongodb";
import schoolModel from "../school/school.model";
import { IFoodDistribution } from "./distribution.interface";
import { FoodDistribution } from "./distribution.model";


// create distribution service function 


const createDistribution = async (payload: IFoodDistribution) =>{


    const school = await schoolModel.findById(payload.schoolId);

    if(!school){
        throw new Error("School not found");
    }

const existingDistribution = await FoodDistribution.findOne({
    schoolId: payload.schoolId,
    date: payload.date,
});

if(existingDistribution){
    throw new Error("Distribution for this school and date already exists");
}
    const distribution = await FoodDistribution.create(payload);
    return distribution;

}

// get all distribution

const getAllDistributions = async () =>{
    const distributions = await FoodDistribution.find();
    return distributions;
}



// other services like get, update, delete can be implemented similarly

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



export const distributionServices = {
    createDistribution,
    getAllDistributions,
    getDistributionById,
    updateDistributionById,
    deleteDistributionById,
    getDistributionBySchoolAndDate,
}
    