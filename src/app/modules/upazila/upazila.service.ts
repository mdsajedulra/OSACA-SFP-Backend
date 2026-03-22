import { ObjectId } from "mongoose";
import { IUpazila } from "./upazila.interface";
import { Upazila } from "./upazila.model";

const createUpazila = async (payload: IUpazila) => {
  const result = await Upazila.create(payload);
  return result;
};
const getAllUpazila = async () => {
  const result = await Upazila.find();
  return result;
};
const getSingleUpazila = async (id: ObjectId) => {
  const result = await Upazila.findById(id);
  return result;
};

const updateUpazila = async (id: ObjectId, payload: Partial<IUpazila>) => {
  const result = await Upazila.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};
// delete upazila 

const deleteUpazila = async (id: ObjectId) => {
  const result = await Upazila.findByIdAndDelete(id);
  return result;
};

export const upazilaService = {
  createUpazila,
  getAllUpazila,
  getSingleUpazila,
  updateUpazila,
  deleteUpazila,
};
