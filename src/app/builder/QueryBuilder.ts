import { Query } from "mongoose";
const excludeField = ["searchTerm", "sort", "fields", "page", "limit"];

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

// filter
  filter(): any {
    const filter = { ...this.query };
    for (const field of excludeField) {
      delete filter[field];
    }
    this.modelQuery = this.modelQuery.find(filter); // distribution.find().find(filter)
    return this
  }
// search
search(searchableField: string[]):this{
 const searchTerm = this.query.searchTerm || "";
 console.log(searchTerm)
  const searchQuery = {
    $or: searchableField.map(field=>({[field]:{$regex: searchTerm, $options:"i"}}))
  }
  this.modelQuery = this.modelQuery.find(searchQuery)
  return this
}
// pagination 
paginate(): this{
  const page = Number(this.query.page) || 1;
  const limit = Number(this.query.limit) || 20;
  const skip = (page - 1) * limit;
  this.modelQuery = this.modelQuery.skip(skip).limit(limit);
  
  return this
}

}
