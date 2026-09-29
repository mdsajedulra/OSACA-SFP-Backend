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
exports.QueryBuilder = void 0;
const excludeField = ["searchTerm", "sort", "fields", "page", "limit"];
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    // filter
    filter() {
        const filter = Object.assign({}, this.query);
        for (const field of excludeField) {
            delete filter[field];
        }
        this.modelQuery = this.modelQuery.find(filter); // modelname.find().find(filter)
        return this;
    }
    // search
    search(searchableField) {
        const searchTerm = this.query.searchTerm || "";
        console.log(searchTerm);
        const searchQuery = {
            $or: searchableField.map((field) => ({
                [field]: { $regex: searchTerm, $options: "i" },
            })),
        };
        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }
    // pagination
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 20;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.modelQuery;
    }
    getMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalDocuments = yield this.modelQuery.model.countDocuments();
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 20;
            const totalPages = Math.ceil(totalDocuments / limit);
            return {
                totalDocuments,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
