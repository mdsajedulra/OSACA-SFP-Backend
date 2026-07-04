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
  searchTerm = this.query.searchTerm || "";
  const searchQuery = {
    $or: searchableField.map(field=>({[field]:{$regex: searchTerm, $options:"i"}}))
  }
  return this
}


}
