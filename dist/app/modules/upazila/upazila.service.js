"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upazilaService = void 0;
const upazila_model_1 = require("./upazila.model");
const createUpazila = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield upazila_model_1.Upazila.create(payload);
    return result;
});
const getAllUpazila = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield upazila_model_1.Upazila.find();
    return result;
});
const getSingleUpazila = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield upazila_model_1.Upazila.findById(id);
    return result;
});
const updateUpazila = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield upazila_model_1.Upazila.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
exports.upazilaService = {
    createUpazila,
    getAllUpazila,
    getSingleUpazila,
    updateUpazila,
};
