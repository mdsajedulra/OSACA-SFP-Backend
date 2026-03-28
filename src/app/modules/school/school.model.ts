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
    schoolNameBangla: { type: String, required: true },
    schoolCode: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    headTeacherPhoneNumber: { type: String, required: true },
    headTeacherName: { type: String, required: true },
    tifinManager: { type: String, required: false },
    tifinManagerPNumber: { type: String, required: false },
   
    totalStudent: {type: Number, required: true},
    address: { type: AddressSchema, required: true },
    numberOfStudent: { type: Number, required: true, default: 0 },
    defaultItems: { type: Number, required: true, default: 0 },
    
  },
  { timestamps: true, strict: true },
);

export default mongoose.model<ISchool>("School", SchoolSchema);
