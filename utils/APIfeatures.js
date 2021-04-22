class APIfeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const queryReqObj = { ...this.queryStr };
    const excludeFields = ['sort', 'page', 'limit', 'fields'];
    excludeFields.forEach((el) => {
      delete queryReqObj[el];
    });
    let queryReqStr = JSON.stringify(queryReqObj);
    queryReqStr = queryReqStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (str) => `$${str}`
    );
    this.query = this.query.find(JSON.parse(queryReqStr));
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortingFields = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortingFields);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  fielding() {
    if (this.queryStr.fields) {
      const selectingFields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(selectingFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIfeatures;
