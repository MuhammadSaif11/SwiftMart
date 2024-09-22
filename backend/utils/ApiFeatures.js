class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const queryObj = { ...this.queryStr };

    const excludedFields = ["page", "sort", "fields", "limit"];
    excludedFields.map((field) => delete queryObj[field]);

    let queryString = JSON.stringify(queryObj).replace(
      /\blt|gt|lte|gte|ne\b/g,
      (match) => `$${match}`
    );

    queryString = JSON.parse(queryString);

    if (queryString.name) {
      queryString = {
        ...queryString,
        name: { $regex: queryString.name, $options: "i" },
      };
    }

    this.query = this.query.find(queryString);

    return this;
  }

  select() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginataion() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 4;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
