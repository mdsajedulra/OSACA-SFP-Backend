import mongoose, { Schema } from "mongoose";
import { IAddress, ISchool } from "./school.interface";


const AddressSchema: Schema<IAddress> = new Schema({
  
    upazilaId: {
            type: Schema.Types.ObjectId,
            ref: "Upazila",
            required: true,
        },

  union: { type: String, required: true },
  
  district: { type: String, required: true },

  
});

const SchoolSchema: Schema<ISchool> = new Schema(
  {
    schoolName: { type: String, required: true },
    schoolCode: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    concernMobileNumber: { type: String, required: true },
    concernName: { type: String, required: true },
    
    totalTeacher: { type: Number, required: true },
    totalStudent: {type: Number, required: true},
    address: { type: AddressSchema, required: true },
    showDetails: { type: String, required: false },
    defaultItems: { type: Number, required: true, default: 0 },
    
  },
  { timestamps: true, strict: true },
);

export default mongoose.model<ISchool>("School", SchoolSchema);
