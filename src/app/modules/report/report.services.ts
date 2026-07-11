import { FoodDistribution } from "../foodDistributions/distribution.model";
import schoolModel from "../school/school.model";

const form4Report = async() =>{

    const schools = await schoolModel.find();

    const distributions = []

   for(const school of schools){
        const distribution = await FoodDistribution.find({schoolId: school?._id}).countDocuments()
        distributions.push(distribution);
    }

    return distributions;

}

export const reportServices = {
    form4Report
}