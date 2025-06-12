class APIFeatures {
  constructor(query, params, formattedParams) {
    this.query = query;
    this.params = params;
    this.formattedParams = formattedParams;
  }

  filter() {
    this.query = this.query.find(this.formattedParams);

    return this;
  }

  sort() {
    if (this.params.sort) {
      this.query.sort(this.params.sort.replace(",", " "));
    } else {
      this.query.sort("createdAt");
    }

    return this;
  }

  limit() {
    if (this.params.fields) {
      const fields = this.params.fields.replaceAll(",", " ");
      this.query.select(fields);
    }

    return this;
  }

  pagination() {
    const page = Number(this.params.page) || 1;
    const limit = Number(this.params.limit) || 10;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
